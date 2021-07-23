//THIS FILE IS DEDICATED SOLELY TOWARDS CAMPGROUND ROUTES.//
const express = require("express");
const router = express.Router();

//MIDDLEWARE
const { isLoggedIn } = require("../middleware/isLoggedIn");

//MODELS REQD.
const Campground = require("../models/campground");

//Utilities
const wrapAsync = require("../utilities/WrapAsync");
const expressError = require("../utilities/ExpressError");

//SCHEMAS FOR VALIDATION
const { campgroundSchema } = require("../JoiSchemas");

// VALIDATE MIDDLEWARE

const validateCampground = (req, res, next) => {
	//Joi Validation for campgrounds
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new expressError(400, msg);
	} else {
		next();
	}
};

// Index page to see all campgrounds
router.get(
	"/",
	wrapAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render("campgrounds/index", { campgrounds });
	})
);

//To create new campground
router.get("/new", isLoggedIn, (req, res) => {
	console.log("Req.User -- ", req.user);
	res.render("campgrounds/new");
});

router.post(
	"/",
	validateCampground,
	isLoggedIn,
	wrapAsync(async (req, res) => {
		if (!req.body.campground) {
			throw new expressError(400, "Invalid Campground Data");
		}
		const newCampground = new Campground(req.body.campground);
		await newCampground.save();
		req.flash("success", "Successfully created a new campground!");
		res.redirect(`campgrounds/${newCampground._id}`);
	})
);

//Show page to view a particular campground
router.get(
	"/:id",
	wrapAsync(async (req, res) => {
		const { id } = req.params;
		const camp = await Campground.findById(id).populate("reviews");
		if (!camp) {
			req.flash("error", "Can't find your campground");
			res.redirect("/campgrounds");
		}
		res.render("campgrounds/show", { camp });
	})
);

//edit page to edit a particular campground
router.get(
	"/:id/edit",
	isLoggedIn,
	wrapAsync(async (req, res) => {
		const { id } = req.params;
		const editCamp = await Campground.findById(id);
		if (!editCamp) {
			req.flash("error", "Can't edit something which can't be found. Sorry!");
			res.redirect("/campgrounds");
		}
		res.render("campgrounds/edit", { editCamp });
	})
);
//patch route to update the query
router.patch(
	"/:id",
	validateCampground,
	isLoggedIn,
	wrapAsync(async (req, res) => {
		if (!req.body.campground) {
			throw new expressError(400, "Invalid Campground Error");
		}
		const { id } = req.params;
		const campground = await Campground.findByIdAndUpdate(
			id,
			{ ...req.body.campground },
			{ new: true }
		);
		req.flash("edit", "Successfully updated the campground");
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

//Delete route to delete campgrounds
router.delete(
	"/:id",
	isLoggedIn,
	wrapAsync(async (req, res) => {
		const { id } = req.params;
		await Campground.findByIdAndDelete(id);
		req.flash("delete", "Successfully deleted the campground!");
		res.redirect("/campgrounds");
	})
);

module.exports = router;
