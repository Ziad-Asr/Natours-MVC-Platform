const User = require('../models/userModel');
const catchAsync = require('../utils/errorHandling/catchAsync');

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

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not yet defined.',
  });
};

exports.geUserById = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not yet defined.',
  });
};

exports.updateUserById = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not yet defined.',
  });
};

exports.deleteUserById = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not yet defined.',
  });
};
