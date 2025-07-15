const User = require('../models/userModel');
const catchAsync = require('../utils/errorHandling/catchAsync');
const AppError = require('../utils/errorHandling/appError');
const allowedFields = require('../utils/allowedFields');

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found.', 404));
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateUserById = catchAsync(async (req, res, next) => {
  const filteredBody = allowedFields(
    req.body,
    'name',
    'email',
    'photo',
    'active',
    'role'
  );
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!updatedUser) return next(new AppError('User not found.', 404));
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteUserById = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError('User not found.', 404));
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
