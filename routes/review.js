
//THIS FILE IS DEDICATED SOLELY TOWARD REVIEW ROUTES

const express = require('express');
const router = express.Router({ mergeParams: true });



//MODELS
const Campground = require('../models/campground');
const Review = require('../models/review');

//Joi Schemas for validation
const { reviewSchema } = require('../JoiSchemas');

//Utilities
const wrapAsync = require('../utilities/WrapAsync');
const expressError = require('../utilities/ExpressError');




//VALIDATE JOI MIDDLEWARE FOR REVIEWS
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






//-----------------------------------------------------------------------------//
//POST Route for Reviews
router.post('/', wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.campID);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created a new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))
//DELETE Route for Reviews
router.delete('/:reviewID', wrapAsync(async (req, res) => {
    const { campID, reviewID } = req.params;
    Campground.findByIdAndUpdate(campID, { $pull: { reviews: reviewID } });
    await Review.findByIdAndDelete(reviewID);
    req.flash('delete', 'Successfully deleted the review!');
    res.redirect(`/campgrounds/${campID}`);
}))


module.exports = router;
