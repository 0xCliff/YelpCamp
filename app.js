const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const catchAsync = require("./utils/catchAsync");
const AppError = require("./utils/AppError");
const Campground = require("./db/models/campground");
const validateCampground = require('./utils/validateCampground');

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error: "))
db.once("open", () => {
    console.log("Database Connected.")
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
const PORT = 3000;

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/campgrounds", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}));

app.get("/campgrounds/add", (req, res) => {
    res.render("campgrounds/add");
});

app.post("/campgrounds", validateCampground, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.get("/campgrounds/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render("campgrounds/show", { campground });
}));

app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render("campgrounds/edit", { campground });
}));

app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
}));

app.all("*", (req, res, next) => {
    next(new AppError("Page Not Found!", 404));
});

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    res.status(statusCode).render("error", { err, statusCode });
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
});