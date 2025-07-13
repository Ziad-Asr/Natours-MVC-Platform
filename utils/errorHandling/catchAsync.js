// Layer 1

module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

// Instead of using try{}catch{} inside all controllers and there is no reusability we made this function.
// This function wraps the (async) block of the controller and get access to (req, res, next).
// We made this to have only one part that catch error using (catch()) instead of typing try{}catch{}.
// and on catching an error we call next(err) that sends it to the next function in app.js that uses (Layer 2) of error handling in app.

// Layer 2 takes the catched error and make it in format we want.
// Layer 3 (the use of layer 2 in app.js):-
// app.all('*', (req, res, next) => {next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404))})

// Layer 3 here takes the new error made in layer 2 and prepare the need error handling response.
// Layer 3 (the use of layer 3 in app.js):-
// app.use(globalErrorHandler);

// ******* If I pass any anything to the next() function, express knows that this is an error.
