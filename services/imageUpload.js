const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/errorHandling/appError');
const catchAsync = require('../utils/errorHandling/catchAsync');

// // Used without using (Sharp)
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, '..', 'public', 'img', 'users'));
//   }, // File destination folder
//   filename: (req, file, cb) => {
//     const imageExtension = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${imageExtension}`);
//   }, // File nameing
// });

// Used with (Sharp) => Because this saves image as a buffer, and be available in (req.file.buffer)
const multerStorage = multer.memoryStorage();

// Only accept images (CAn make this with any other file types)
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Uploaded file is not an image, please upload an image instead!',
        400
      ),
      false
    );
  }
};

const imageUpload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// --------------------------------------------------------------
// Single Image
const uploadSingleImage = imageUpload.single('photo');

const resizeSingleImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    // .jpeg({ quality: 90 }) // Compress by decreasing the quality to 90%
    .toFile(
      path.join(__dirname, '..', 'public', 'img', 'users', req.file.filename)
    );

  next();
});

// --------------------------------------------------------------
// Mutiple Images
const uploadManyImages = imageUpload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

const resizeMultipleImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `cover-${req.params.id}-${Date.now()}.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    // .jpeg({ quality: 90 })
    .toFile(
      path.join(__dirname, '..', 'public', 'img', 'users', req.file.filename)
    );

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `product-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(
          path.join(
            __dirname,
            '..',
            'public',
            'img',
            'users',
            req.file.filename
          )
        );

      req.body.images.push(filename);
    })
  );

  next();
});

module.exports = {
  uploadSingleImage,
  resizeSingleImage,
  uploadManyImages,
  resizeMultipleImages,
};

// Used as a middleware before the targeted endpoint.

// Single image upload => upload.single('db-field-name')
// Multiple images upload => imageUpload.fields([{ name: 'db-field-name', maxCount: 3 }]);
