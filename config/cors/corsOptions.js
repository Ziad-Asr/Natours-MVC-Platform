const allowedOrigins = require('./allowedOrigins');

let corsOptions;

if (process.env.NODE_ENV === 'developement') {
  // For testing on postman.
  corsOptions = {
    origin: (origin, callback) => {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // To accept cookies sent with request
    optionsSuccessStatus: 200,
  };
} else if (process.env.NODE_ENV === 'production') {
  corsOptions = {
    origin: (origin, callback) => {
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  };
}

module.exports = corsOptions;
