const express = require('express');

const { reviewSchema } = require('../db/schemas');
const Campground = require('../db/models/campground');
const Review = require('../db/models/review');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new AppError(msg, 400);
  } else {
    next();
  }
};

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  validateReview,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const { review } = req.body;

    const campground = await Campground.findById(id);
    const newReview = new Review(review);
    campground.reviews.push(newReview);

    await newReview.save();
    await campground.save();

    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  '/:reviewId',
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
