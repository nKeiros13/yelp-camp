//THIS FILE IS DEDICATED SOLELY TOWARDS CAMPGROUND ROUTES.//
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

//MIDDLEWARE
const {
	isLoggedIn,
	isAuthor,
	validateCampground,
} = require("../middleware/middleware");

//CONTROLLERS
const campgrounds = require("../controllers/campground");

//Utilities
const wrapAsync = require("../utilities/WrapAsync");
//------------------------------------------------------------------------------------//

// ROUTE TO SHOW THE INDEX AND TO CREATE A NEW CAMPGROUND

router
	.route("/")
	.get(wrapAsync(campgrounds.getIndex))
	.post(
		isLoggedIn,
		upload.array("image"),
		validateCampground,
		wrapAsync(campgrounds.createNewCampground)
	);
//To create new campground
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

//ROUTE TO SHOW CAMPGROUND, EDIT A CAMPGROUND AND DELETE A CAMPGROUND
router
	.route("/:id")
	.get(wrapAsync(campgrounds.showCampground))
	.patch(
		isLoggedIn,
		isAuthor,
		upload.array("image"),
		validateCampground,
		wrapAsync(campgrounds.editCampground)
	)
	.delete(isLoggedIn, isAuthor, wrapAsync(campgrounds.deleteCampground));

//edit page to edit a particular campground
router.get(
	"/:id/edit",
	isLoggedIn,
	isAuthor,
	wrapAsync(campgrounds.renderEditForm)
);

module.exports = router;
