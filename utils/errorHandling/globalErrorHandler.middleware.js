// Layer 3

const {
  handleCastErrorDB,
  handleDublicateFields,
  handleValidationErrorDB,
  handleJWTError,
  handleJWTExpiredError,
  handleCORSError,
} = require('./helpers/operationalErrorsHelpers');
const { sendErrorDev, sendErrorProd } = require('./helpers/devProdHelpers');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'developement') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // Handling Operational errors :-
    //--------------------------------

    // 1) Mongoose errors
    //        -----
    // 1) operational error => Invalid ID
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    // 2) Operational error => duplicate key for unique keys
    if (err.code === 11000) err = handleDublicateFields(err);
    // 3) Operational error => validation
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err); // ex:- entering string in a number field

    // 2) JWT Error
    //      ----
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

    // 3) CORS
    //  ----
    if (err.message === 'Not allowed by CORS') err = handleCORSError();

    sendErrorProd(err, res);
  }
};

// I should send the error from the controller by (calling next(error)) in the end of all functions,
// to catch it and handle it here in the global error handlin function.

// Here we send a detailed response with all info about the error and the stack error during (dev) to the developer.
// And send a user friendly short errors while (prod) to the user.
