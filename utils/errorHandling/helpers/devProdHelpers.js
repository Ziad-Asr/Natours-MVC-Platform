// Helper funstions for Layer 3

exports.sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
exports.sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // console.error('Error', err); // For Heroku

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong.',
    });
  }
};

// These are helper functions used to return a custom response for dev and another response for the production even it's (operational or not)

// ****************************************************
// ***** VERY IMPORTANT *****
// in (sendErrorProd) if the error (isOperational) that means it is (Operational error), so I can send the details of the error,
// but if it is not (isOperational) that means that it is (programming error), so I will not leak the error info to the user then,
// So I 1) send only a generic message 2) Console that there is an error.

// *** Operational errors (cast errors) => Errors that I know and trust (Because I have manually set them as operational)
// There are 3 types of mongoose errors that I can mark as operational (
// Not found ID - mongoose validation errors {made in model schema} - Duplicate keys {made in model schema} )
// ****************************************************
