
//THIS FILE IS DEDICATED SOLELY TOWARDS CAMPGROUND ROUTES.//
const express = require('express');
const router = express.Router();


//MODELS REQD.
const Campground = require('../models/campground');

//Utilities
const wrapAsync = require('../utilities/WrapAsync');
const expressError = require('../utilities/ExpressError');


//SCHEMAS FOR VALIDATION
const { campgroundSchema } = require('../JoiSchemas');




// VALIDATE MIDDLEWARE

const validateCampground = (req, res, next) => {
    //Joi Validation for campgrounds
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new expressError(400, msg)
    } else {
        next();
    }
}



// Index page to see all campgrounds
router.get('/', wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

//To create new campground
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

router.post('/', validateCampground, wrapAsync(async (req, res) => {
    if (!req.body.campground) {
        throw new expressError(400, 'Invalid Campground Data');
    }
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    req.flash('success', 'Successfully created a new campground!');
    res.redirect(`campgrounds/${newCampground._id}`);

}))

//Show page to view a particular campground
router.get('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', { camp });
}))

//edit page to edit a particular campground
router.get('/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const editCamp = await Campground.findById(id);
    res.render('campgrounds/edit', { editCamp });
}))
//patch route to update the query
router.patch('/:id', validateCampground, wrapAsync(async (req, res) => {
    if (!req.body.campground) {
        throw new expressError(400, 'Invalid Campground Error');
    }
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true });
    req.flash('edit', 'Successfully updated the campground');
    res.redirect(`/campgrounds/${campground._id}`);
}))


//Delete route to delete campgrounds
router.delete('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('delete', 'Successfully deleted the campground!');
    res.redirect('/campgrounds');
}))

module.exports = router;
