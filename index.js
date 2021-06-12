const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utilities/WrapAsync');
const expressError = require('./utilities/ExpressError');
const Joi = require('joi');
const { campgroundSchema } = require('./JoiSchemas');

//connecting to mongoose database 
mongoose.connect('mongodb://localhost:27017/yelp-camp',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
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


const validateCampground = (req, res, next) => {
    //Joi Validation
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new expressError(400, msg)
    } else {
        next();
    }
}


//----------------------------------------------------------------------------//
//Express Routes

app.get('/', (req, res) => {
    res.render('home');
})
// Index page to see all campgrounds
app.get('/campgrounds', wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

//To create new campground
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})
app.post('/campgrounds', validateCampground, wrapAsync(async (req, res) => {
    if (!req.body.campground) {
        throw new expressError(400, 'Invalid Campground Data');
    }
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`campgrounds/${newCampground._id}`);

}))

//Show page to view a particular campground
app.get('/campgrounds/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const foundCamp = await Campground.findById(id);
    res.render('campgrounds/show', { foundCamp });
}))

//edit page to edit a particular campground
app.get('/campgrounds/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const editCamp = await Campground.findById(id);
    res.render('campgrounds/edit', { editCamp });
}))
//patch route to update the query
app.patch('/campgrounds/:id', validateCampground, wrapAsync(async (req, res) => {
    if (!req.body.campground) {
        throw new expressError(400, 'Invalid Campground Error');
    }
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true });
    res.redirect(`/campgrounds/${campground._id}`);
}))


//Delete route to delete campgrounds
app.delete('/campgrounds/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))



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
