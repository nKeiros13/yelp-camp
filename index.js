if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}
//Node packages
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require("helmet");

const mongoSanitize = require("express-mongo-sanitize");

//Utilities
const wrapAsync = require("./utilities/WrapAsync");
const expressError = require("./utilities/ExpressError");
//Joi Schemas for validation

const userRoutes = require("./routes/user");
const campgroundRoutes = require("./routes/campground");
const reviewRoutes = require("./routes/review");

const session = require("express-session");
const flash = require("connect-flash");
const { contentSecurityPolicy } = require("helmet");

const dbURL = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
//"mongodb://localhost:27017/yelp-camp"
//connecting to mongoose database
mongoose.connect(dbURL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
	console.log("Database Connected!");
});
const MongoStore = require("connect-mongo");

//----------------------------------------------------------------------------//
//MIDDLEWARE SECTION

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const secret = process.env.SECRET || "devolpmentisshit";

const store = MongoStore.create({
	mongoUrl: dbURL,
	touchAfter: 24 * 60 * 60,
	crypto: {
		secret,
	},
});

store.on("error", function (e) {
	console.log("Session Store Error: ", e);
});

const sessionConfig = {
	store,
	name: "doublecross",
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		//secure: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
	"https://stackpath.bootstrapcdn.com/",
	"https://api.tiles.mapbox.com/",
	"https://api.mapbox.com/",
	"https://kit.fontawesome.com/",
	"https://cdnjs.cloudflare.com/",
	"https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
	"https://kit-free.fontawesome.com/",
	"https://stackpath.bootstrapcdn.com/",
	"https://api.mapbox.com/",
	"https://api.tiles.mapbox.com/",
	"https://fonts.googleapis.com/",
	"https://use.fontawesome.com/",
	"https://fonts.gstatic.com/",
	"https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
	"https://api.mapbox.com/",
	"https://a.tiles.mapbox.com/",
	"https://b.tiles.mapbox.com/",
	"https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", "blob:"],
			objectSrc: [],
			imgSrc: [
				"'self'",
				"blob:",
				"data:",
				"https://res.cloudinary.com/dnzod6dqz/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
				"https://images.unsplash.com/",
			],
			fontSrc: ["'self'", ...fontSrcUrls],
		},
	})
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash("success");
	res.locals.del = req.flash("delete");
	res.locals.edit = req.flash("edit");
	res.locals.error = req.flash("error");
	next();
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:campID/reviews", reviewRoutes);

//----------------------------------------------------------------------------//
//Express Routes

app.get("/", (req, res) => {
	res.render("home");
});

app.get("/fakeUser", async (req, res) => {
	const u = new User({ email: "delta@airlines.com", username: "delta!" });
	const newU = await User.register(u, "koo!koo!");
	res.send(newU);
});

//----------------------------------------------------------------------------//
//To catch all possible routes which doesnt match the above routes
app.all("*", (req, res, next) => {
	next(new expressError(404, "Page Not Found!"));
});

//Basic error handler middlewares
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) {
		err.message = "Oh, boy! Something went wrong...";
	}
	if (!err.statusCode) {
		err.statusCode = 500;
	}
	res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
	console.log("Serving on port 3000.");
});
