//MODELS
const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createNewReview = async (req, res) => {
	const campground = await Campground.findById(req.params.campID);
	const review = new Review(req.body.review);
	review.author = req.user._id;
	campground.reviews.push(review);
	await review.save();
	await campground.save();
	req.flash("success", "Successfully created a new review!");
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
	const { campID, reviewID } = req.params;
	Campground.findByIdAndUpdate(campID, { $pull: { reviews: reviewID } });
	await Review.findByIdAndDelete(reviewID);
	req.flash("delete", "Successfully deleted the review!");
	res.redirect(`/campgrounds/${campID}`);
};
