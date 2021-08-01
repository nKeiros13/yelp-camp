const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const imageSchema = new Schema({
	url: String,
	filename: String,
});

imageSchema.virtual("thumbnail").get(function () {
	return this.url.replace("/upload", "/upload/w_200");
});

const campGroundSchema = new Schema({
	title: String,
	image: [imageSchema],
	price: Number,
	description: String,
	location: String,
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	reviews: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Review",
		},
	],
});

campGroundSchema.post("findOneAndDelete", async function (doc) {
	if (doc) {
		await Review.deleteMany({
			_id: { $in: doc.reviews },
		});
	}
});

module.exports = mongoose.model("Campground", campGroundSchema);
