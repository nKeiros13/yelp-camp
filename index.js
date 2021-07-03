//Node packages
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const path = require('path');
//Models
const Campground = require('./models/campground');
const Review = require('./models/review');
//Utilities
const wrapAsync = require('./utilities/WrapAsync');
const expressError = require('./utilities/ExpressError');
//Joi Schemas for validation
const { campgroundSchema, reviewSchema } = require('./JoiSchemas');

const campgrounds = require('./routes/campground');
const reviews = require('./routes/review');




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



const validateReview = (req, res, next) => {
    //Joi Validation for reviews
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new expressError(400, msg)
    } else {
        next();
    }
}


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
