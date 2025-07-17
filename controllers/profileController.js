const User = require('../models/userModel');
const AppError = require('../utils/errorHandling/appError');
const catchAsync = require('../utils/errorHandling/catchAsync');
const allowedFields = require('../utils/allowedFields');

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req?.user?.id).select('-__v');
  if (!user) return next(new AppError('User not found.', 404));
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const filteredBody = allowedFields(req.body, 'name', 'email', 'active');
  if (req.file) filteredBody.photo = req.file.filename; // Adding image name to the user.

  const user = await User.findById(req?.user?.id).select('-__v');
  if (!user) return next(new AppError('User not found.', 404));

  const updatedUser = await User.findByIdAndUpdate(
    req?.user?.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );
  // As we know that (findByIdAndUpdate) does not run (.pre(save)) middlewares,
  // but since here we don't deal with (password) {used in .pre(save)} so that is ok to use it now.

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req?.user?.id);
  if (!user) return next(new AppError('User not found.', 404));

  await User.findByIdAndDelete(req?.user?.id);

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully.',
  });
});

exports.softDeleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user?.id);
  if (!user) return next(new AppError('User not found.', 404));

  user.active = false;
  await user.save({ validateBeforeSave: false });

  res.status(204).json({ status: 'success', data: null });
});
// Soft delete (making user inactive & prevent returning inactive users or making any operations on them) {{{ Not used here }}}
