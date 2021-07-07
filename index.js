//Node packages
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const path = require('path');

//Utilities
const wrapAsync = require('./utilities/WrapAsync');
const expressError = require('./utilities/ExpressError');
//Joi Schemas for validation

const campgrounds = require('./routes/campground');
const reviews = require('./routes/review');

const session = require('express-session');
const flash = require('connect-flash');


//connecting to mongoose database 
mongoose.connect('mongodb://localhost:27017/yelp-camp',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Database Connected!");
});

//----------------------------------------------------------------------------//
//MIDDLEWARE SECTION


const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));



const sessionConfig = {
    secret: "Pleasedontcopymysecret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.del = req.flash('delete');
    res.locals.edit = req.flash('edit');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:campID/reviews', reviews);


//----------------------------------------------------------------------------//
//Express Routes

app.get('/', (req, res) => {
    res.render('home');
})


//----------------------------------------------------------------------------//
//To catch all possible routes which doesnt match the above routes
app.all('*', (req, res, next) => {
    next(new expressError(404, 'Page Not Found!'));
})




//Basic error handler middlewares
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = 'Oh, boy! Something went wrong...';
    }
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    res.status(statusCode).render('error', { err });
})


app.listen(3000, () => {
    console.log("Serving on port 3000.");
})
