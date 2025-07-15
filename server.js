// 1) Make sure that user that perform action has the same user id in the seent body or the same id in this collection.
//    (req.user.id === review.userID) {review => 1)recieves data from req.body 2)data in this review collection}
//     => getAll - getOne - Create - update - delete
// The best way is to take the userId from (req.user.id) in {getAll - getOne - create}, get userId fron (req.user.id) + ((compare)) in (update - delete)

// 2) Return array of errors (or) the first error only.

// 3) Make reviews and other modules that deal with user id => Do not recieve the id from req, but extract it from the token + role
//    Then do the needed security and authorization, (only make filter with user id {{{ for admins only }}}). (getAll) endpoint for admins.
//    And make another getAll endpoint for users.

// --------------------------------------------------------

const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const limiter = require('./config/limiter');
const AppError = require('./utils/errorHandling/appError');
const globalErrorHandler = require('./utils/errorHandling/globalErrorHandler.middleware');
const connectDB = require('./config/connectDB');
const corsOptions = require('./config/cors/corsOptions');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const profileRouter = require('./routes/profileRoutes');
const reviewRouter = require('./routes/reviewRoutes');

// Handle uncaught exceptions first
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// DB Connection
connectDB();

// Express app
const app = express();

// Middleware => CORS setup
app.use(cors(corsOptions));

// Middleware => Set security http headers.
app.use(helmet());

// Middleware => Adding time stamp to each incomming request.
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Middleware => Number of requests limiter.
app.use('/api', limiter);

// Middleware => Parse (req.body) data as a json (max: 10kb).
app.use(express.json({ limit: '10kb' }));

// Middleware => Parsing cookies in (req.body) into json.
app.use(cookieParser());

// Middleware => Data sanitization agaist NoSQL query injection.
app.use(mongoSanitize());

// Middleware => Data sanitization XSS.
app.use(xss());

app.use(hpp({ whitelist: ['name', 'dates'] })); //whitelist of duplicate params in (filter) {use name filter twice or more (name=z&name=q)

// Middleware => Console.log the request header and status.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware => Accessing static fills in (public) folder.
app.use(express.static(`${__dirname}/public`));

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);

// Error Handling => Handle unknown routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

// Error Handling => Global error handler functiona call
app.use(globalErrorHandler);

// Starting the server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});

// Error Handling => Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
