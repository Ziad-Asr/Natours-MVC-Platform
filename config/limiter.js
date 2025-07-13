const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  max: 100, // Number of request
  windowMs: 1000 * 60 * 60, // Time window (1H)
  message: 'Too many messages from this IP, please try again later in an hour!',
});

module.exports = limiter;

// StatusCode: 429 => Too many requests
