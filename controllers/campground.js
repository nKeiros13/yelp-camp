const Campground = require("../models/campground");
const expressError = require("../utilities/ExpressError");
const { cloudinary } = require("../cloudinary/index");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });

module.exports.getIndex = async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
	res.render("campgrounds/new");
};

module.exports.createNewCampground = async (req, res) => {
	if (!req.body.campground) {
		throw new expressError(400, "Invalid Campground Data");
	}
	const geoData = await geocoder.forwardGeocode({
		query: req.body.campground.location,
		limit: 1
	}).send();
	const newCampground = new Campground(req.body.campground);
	newCampground.geometry = geoData.body.features[0].geometry;
	newCampground.image = req.files.map((f) => ({
		url: f.path,
		filename: f.filename,
	}));
	newCampground.author = req.user._id;
	await newCampground.save();
	console.log(newCampground);
	req.flash("success", "Successfully created a new campground!");
	res.redirect(`campgrounds/${newCampground._id}`);
};

module.exports.showCampground = async (req, res) => {
	const { id } = req.params;
	const camp = await Campground.findById(id)
		.populate({ path: "reviews", populate: { path: "author" } })
		.populate("author");
	if (!camp) {
		req.flash("error", "Can't find your campground");
		res.redirect("/campgrounds");
	}
	res.render("campgrounds/show", { camp });
};

module.exports.renderEditForm = async (req, res) => {
	const { id } = req.params;
	const editCamp = await Campground.findById(id);
	if (!editCamp) {
		req.flash("error", "Can't edit something which can't be found. Sorry!");
		res.redirect("/campgrounds");
	}
	res.render("campgrounds/edit", { editCamp });
};

module.exports.editCampground = async (req, res) => {
	if (!req.body.campground) {
		throw new expressError(400, "Invalid Campground Error");
	}
	const { id } = req.params;
	const campground = await Campground.findByIdAndUpdate(
		id,
		{ ...req.body.campground },
		{ new: true }
	);
	const imgs = req.files.map((f) => ({
		url: f.path,
		filename: f.filename,
	}));
	campground.image.push(...imgs);
	await campground.save();
	if (req.body.deleteImage) {
		for (let filename of req.body.deleteImage) {
			await cloudinary.uploader.destroy(filename);
		}
		const trimedImagesForDelete = req.body.deleteImage.map((aImg) =>
			aImg.trim()
		);
		await campground.updateOne({
			$pull: { image: { filename: { $in: trimedImagesForDelete } } },
		});
	}
	req.flash("edit", "Successfully updated the campground");
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
	const { id } = req.params;
	await Campground.findByIdAndDelete(id);
	req.flash("delete", "Successfully deleted the campground!");
	res.redirect("/campgrounds");
};
