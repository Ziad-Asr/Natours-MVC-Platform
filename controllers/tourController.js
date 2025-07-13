const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/errorHandling/catchAsync');
const AppError = require('../utils/errorHandling/appError');

// Middleware
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// CRUD
exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  // In here, we gave the class the first made query (Tour.find()) without any work made on it, it returns all data it get.
  // Then give it the (req.query) which is the (query) passed in the url (ex:- localhost:3000/tours?page=1&price[lt]=50)
  // This we called all the functions we need to call frominside this class.
  // Where each function make some manipulation on the query and then return it to us again

  const tours = await features.query;
  // Then here we (await the final query that has all data we need using our queries)

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: { tours },
  });
});

exports.getTourById = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError(`No tour found with this id`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { tour: newTour },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedTour) {
    return next(new AppError(`No tour found with this id`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: { tour: updatedTour },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const deletedTour = await Tour.findByIdAndDelete(req.params.id);

  if (!deletedTour) {
    return next(new AppError(`No tour found with this id`, 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully.',
  });
});

// Aggrigation piplines
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id: '$ratingsAverage',
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 }, // 1 => Ascending order
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req?.params?.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
      // Each tour has array of start dates (ex:- 3 start dates),
      // so (unwind) make it 3 tours and each tour with one startdate, and the other data of the tour is the same.
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0, // Delete the field (_id) from the response
      },
    },
    {
      $sort: { month: 1 },
    },
    // {
    //   $limit: 6,
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});
