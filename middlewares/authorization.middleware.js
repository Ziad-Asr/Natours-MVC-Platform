const AppError = require('../utils/errorHandling/appError');
const catchAsync = require('../utils/errorHandling/catchAsync');

const authorization = (...allowedRoles) => {
  return catchAsync(async (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  });
};

module.exports = authorization;
