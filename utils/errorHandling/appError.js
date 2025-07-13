// Layer 2

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

// super(message) => Super is used in the instructor function to call the parent class.
// we send here (message), because the (Error) class only accepts the (message) as an argument.

// the (status) of the error depends on the (status code) of the error.
// statusCode: (404, 400) => status: Fail , statusCode: 500 => status: error.
// We could send the status directly as we send message and statusCode, but we used this way.

// there are 2 types of error => (Operational - Programming)
// Operational errors => like (hitting not found route - hitting wrong param - ...)
// Programming error => Error in my code due to my foult.

// Error.captureStackTrace(this, this.constructor) => Means when a new error object is made and this class' constructor function runs,
//                                                    this error will appear in the (global error stack) of the app.
