// Helper funstions (for Layer 3)

const AppError = require('../appError');

// 1) Operational errors (Mongoose)
exports.handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
exports.handleDublicateFields = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]; // Extracting the duplicate key value from the mongoose message.
  const message = `Duplicate field value: ${value}, Please use another value.`;
  return new AppError(message, 400);
};
exports.handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data, ${errors.join(', ')}`;
  return new AppError(message, 400);
};

// 2) Operational errors (JWT)
exports.handleJWTError = () => {
  return new AppError('Invalid token. Please log in again!', 401);
};
exports.handleJWTExpiredError = () => {
  return new AppError('Your token has expired! Please log in again.', 401);
};

// 3) Operational errors (CORS)
exports.handleCORSError = () => {
  return new AppError('You are requesting from an unauthorized network.', 403);
};

// Here these are helper functions help in handling the 3 operational errors (mongoose) - JWT errors,
// they role only is extracting the errors from the moongose response which is not readble, and turn them into a good format using Layer 2,
// and the same for (jwt errors)

// we uses here layer 2 only for reformating the error, and make it humen friendly.
