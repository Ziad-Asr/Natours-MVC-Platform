const Review = require('../models/reviewModel');
const catchAsync = require('../utils/errorHandling/catchAsync');

exports.getAllReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find();

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.getReiviewById = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError(`No review found with this id`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { review: newReview },
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedReview) {
    return next(new AppError(`No review found with this id`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: { review: updatedReview },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const deletedReview = await Review.findByIdAndDelete(req.params.id);

  if (!deletedReview) {
    return next(new AppError(`No review found with this id`, 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Review deleted successfully.',
  });
});
