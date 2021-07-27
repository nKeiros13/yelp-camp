const { campgroundSchema, reviewSchema } = require("../JoiSchemas");
const expressError = require("../utilities/ExpressError");
const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl;
		req.flash("error", "You must be signed in!");
		return res.redirect("/login");
	}
	next();
};

module.exports.validateCampground = (req, res, next) => {
	//Joi Validation for campgrounds
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new expressError(400, msg);
	} else {
		next();
	}
};

module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if (!campground.author.equals(req.user._id)) {
		req.flash("error", "Error! You are not authorized to do that!");
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
	const { campID, reviewID } = req.params;
	const review = await Review.findById(reviewID);
	if (!review.author.equals(req.user._id)) {
		req.flash("error", "Error! You are not authorized to do that!");
		return res.redirect(`/campgrounds/${campID}`);
	}
	next();
};

module.exports.validateReview = (req, res, next) => {
	//Joi Validation for reviews
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new expressError(400, msg);
	} else {
		next();
	}
};
