//THIS FILE IS DEDICATED SOLELY TOWARD REVIEW ROUTES

const express = require("express");
const router = express.Router({ mergeParams: true });

//Utilities
const wrapAsync = require("../utilities/WrapAsync");
const {
	validateReview,
	isLoggedIn,
	isReviewAuthor,
} = require("../middleware/middleware");

//CONTROLLERS
const reviews = require("../controllers/review");

//-----------------------------------------------------------------------------//
//POST Route for Reviews
router.post(
	"/",
	validateReview,
	isLoggedIn,
	wrapAsync(reviews.createNewReview)
);
//DELETE Route for Reviews
router.delete(
	"/:reviewID",
	isLoggedIn,
	isReviewAuthor,
	wrapAsync(reviews.deleteReview)
);

module.exports = router;
