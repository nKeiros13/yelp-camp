const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

//connecting to mongoose database
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
	console.log("Database Connected!");
});
//---------------------------------------------------------------------------//

const sampleNames = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 100; i++) {
		let random1000 = Math.floor(Math.random() * 1000);
		let price = Math.floor(Math.random() * 100) * 10;
		await new Campground({
			author: "60fbaf70b04a1a4f8c43f47e",
			title: `${sampleNames(descriptors)} ${sampleNames(places)}`,
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			description:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo tempora consequatur blanditiis ex tenetur similique quod ratione iste, esse, rerum nulla. Corporis, porro laudantium voluptas laboriosam pariatur officia quaerat iure.",
			geometry: { type: "Point", coordinates: [88.33778, 22.54111] },
			image: [
				{
					url: "https://res.cloudinary.com/dnzod6dqz/image/upload/v1627573144/YelpCamp/nssmtyoyn31ohpchfmkv.jpg",
					filename: "YelpCamp/nssmtyoyn31ohpchfmkv",
				},
				{
					url: "https://res.cloudinary.com/dnzod6dqz/image/upload/v1627573150/YelpCamp/cr0hwcxzsqbu9fi1ir2b.jpg",
					filename: "YelpCamp/cr0hwcxzsqbu9fi1ir2b",
				},
				{
					url: "https://res.cloudinary.com/dnzod6dqz/image/upload/v1627573167/YelpCamp/wxvdfozihrueddzaynri.jpg",
					filename: "YelpCamp/wxvdfozihrueddzaynri",
				},
			],
			price,
		}).save();
	}
};

seedDB()
	.then(() => {
		console.log("Operation completed, saheb!");
		mongoose.connection.close();
	})
	.catch((e) => {
		console.log("Error!");
		console.log(e);
	});

//----------------------------------------------------------------------------//
