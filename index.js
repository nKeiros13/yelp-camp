const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

//connecting to mongoose database 
mongoose.connect('mongodb://localhost:27017/yelp-camp',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Database Connected!");
});

//----------------------------------------------------------------------------//



const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);


//----------------------------------------------------------------------------//
//Async function utility
function wrapAsync(func) {
    return function (req, res, next) {
        func(req, res, next).catch(e => next(e));
    }
}

//----------------------------------------------------------------------------//


app.get('/', (req, res) => {
    res.render('home');
})
// Index page to see all campgrounds
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
})

//To create new campground
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})
app.post('/campgrounds', wrapAsync(async (req, res) => {
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`campgrounds/${newCampground._id}`);

}))

//Show page to view a particular campground
app.get('/campgrounds/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const foundCamp = await Campground.findById(id);
    res.render('campgrounds/show', { foundCamp });
}))

//edit page to edit a particular campground
app.get('/campgrounds/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const editCamp = await Campground.findById(id);
    res.render('campgrounds/edit', { editCamp });
}))
//patch route to update the query
app.patch('/campgrounds/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true });
    res.redirect(`/campgrounds/${campground._id}`);
}))


//Delete route to delete campgrounds
app.delete('/campgrounds/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))



//----------------------------------------------------------------------------//
//Basic error handler middlewares
app.use((err, req, res, next) => {
    res.send('<center><h1>Oh boy! Something went wrong...</h1></center>');
})


app.listen(3000, () => {
    console.log("Serving on port 3000.");
})
