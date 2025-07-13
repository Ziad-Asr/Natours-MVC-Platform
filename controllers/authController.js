const User = require('../models/userModel');
const AppError = require('../utils/errorHandling/appError');
const catchAsync = require('../utils/errorHandling/catchAsync');
const createAndSendToken = require('../utils/jwt/createAndSendToken');
const sendEmail = require('../services/email');
const allowedFields = require('../utils/allowedFields');
const crypto = require('crypto');

// ###########################################################
// ###############
// ### Sign Up ###
// ###############

// (senerio 1)
exports.signup = catchAsync(async (req, res, next) => {
  const filteredBody = allowedFields(
    req.body,
    'name',
    'email',
    'role',
    'password',
    'passwordConfirm',
    'passwordChangedAt'
  );

  const newUser = await User.create(filteredBody);

  newUser.password = undefined; // Remove password from the output
  createAndSendToken(res, newUser, 201);
});

// (senerio 2)
// ...

// ###########################################################
// #############
// ### Login ###
// #############

// (senerio 1)
exports.login = catchAsync(async (req, res, next) => {
  const filteredBody = allowedFields(req.body, 'email', 'password');

  // 1) Check if (email) is exist
  if (!filteredBody?.email || !filteredBody?.password) {
    return next(new AppError('Please, enter email and password!'), 400);
  }

  // 2) Check if (email) is exist {in controller}
  //    & (password) is correct {in model schema}
  const user = await User.findOne({ email: filteredBody?.email }).select(
    '+password'
  );
  if (
    !user ||
    !(await user.correctPassword(filteredBody?.password, user.password))
  ) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // 3) Remove password before sending response
  user.password = undefined;

  createAndSendToken(res, user, 200);
});

// (senerio 2)
// ...

// ###########################################################
// #######################
// ### Forget password ###
// #######################

// (senerio 1)
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const filteredBody = allowedFields(req.body, 'email');

  // 1) Get user by the entered email
  const user = await User.findOne({ email: filteredBody?.email });
  if (!user) {
    return next(new AppError(`There is no user with this email address!`, 404));
  }

  // 2) Generate a reset token (not jwt) => Made in User schema (because it is related to data directly)
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // Because we didn't save the new feild (resetToken,tokenexpiresDate) in the DB in (createPasswordResetToken) in model
  // We scripe the validation of saving a user document, because it think we are logging in or register and that is false now.

  // 3) Send the reset token into user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetPassword/${resetToken}`;

  const message = `Forgot your password? Send a request to this URL: ${resetURL}.\nIf you did not forget your password, so please ignore this email.`;

  try {
    await sendEmail({
      email: user?.email,
      subject: 'Your subject reqset url (Valid for 3 minutes)',
      message,
      resetURL,
    });

    // 4) Send a response for user (Good user experience to tell him to check his email)
    res.status(200).json({
      status: 'success',
      message: 'Check your email for the reset password url.',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        `There was an error sending the email, Please try again later!`,
        500
      )
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const filteredParams = allowedFields(req.params, 'reset_token');
  const filteredBody = allowedFields(req.body, 'password', 'passwordConfirm');

  // 1) Get the user based on sent token.
  const hashedToken = crypto
    .createHash('sha256')
    .update(filteredParams?.reset_token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });

  // 2) if (this user is exist & token has not expired) => Set the new password.
  if (!user) {
    return next(new AppError(`Token is invalid or has expired!`, 400));
  }
  user.password = filteredBody?.password;
  user.passwordConfirm = filteredBody?.passwordConfirm;

  // 3) update the (changedPasswordAT) property in users shema
  user.passwordChangedAt = Date.now();
  (user.passwordResetToken = undefined),
    (user.passwordResetExpires = undefined),
    await user.save(); // this will trigger the pre-save hook

  // 4) Log the user in & send JWT
  createAndSendToken(res, user, 200);
});

// (senerio 2)
// ...

// ###########################################################
// #######################
// ### Update Password ###
// #######################

exports.updatePassword = catchAsync(async (req, res, next) => {
  const filteredBody = allowedFields(
    req.body,
    'currentPassword',
    'newPassword',
    'newPasswordConfirm'
  );

  // 1) Validate inputs
  if (
    !filteredBody?.currentPassword ||
    !filteredBody?.newPassword ||
    !filteredBody?.newPasswordConfirm
  ) {
    return next(
      new AppError('Please provide current, new, and confirm password.', 400)
    );
  }

  // 2) Get user from database using ID from protect middleware
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  // 3) Check if the current password is correct
  const isCorrect = await user.correctPassword(
    filteredBody?.currentPassword,
    user.password
  );
  if (!isCorrect) {
    return next(new AppError('Your current password is incorrect.', 403));
  }

  // 4) Update to new password
  user.password = filteredBody?.newPassword;
  user.passwordConfirm = filteredBody?.newPasswordConfirm;
  await user.save(); // Triggers pre-save hook to hash the password

  // 5) Log the user in again with new token
  createAndSendToken(res, user, 200);
});

// {{{ await user.save() }}}
// 1) To run the validation in the schema
// 2) To trigger the pre-save hook.
// *** If I used {{{ findByIdAndUpdate }}} will not do 1 and 2, because they only work with (save (1,2) - create (1))
