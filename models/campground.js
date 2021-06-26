const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const campGroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

campGroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.remove({
            _id: { $in: doc.reviews }
        })
    }
})

module.exports = new mongoose.model('Campground', campGroundSchema);
