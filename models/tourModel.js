const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        }, // this only points to current doc on NEW document creation
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    // ---------------------------------------------
    // Locations on map
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // [Lat, Long]
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number], // [Lat, Long]
        address: String,
        description: String,
        day: Number,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
// put additional indexes on the primery indexes (_id & name).
// There are 3 new indexes in the DB (price - slug - price&ratingsAverage)
// (1) => ascending & (-1) => descending
// We choose the field to sort based on, because it's the most populer users search by or filter with.
// ***** much better Performance *****

// Mongoose middlewares :-
// -----------------------
// 4 Types => (Document middleware) - (Query middleware) - (Aggrigation middleware) - (Modle middleware)
// Done when we press to (save => POST {.save(), .create() only}) document to the DB, and before it accually saved. (pre)
// Or to run after the accual save in the DB. (post)

// 1) ( Document middleware ) => pre / post { .save() - .create() } events ((( not .insertMany(), not getByIdAndUpdate() ))).
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
}); // this => presaved doc

tourSchema.post('save', function (savedDocument, next) {
  console.log(savedDocument);
  next();
});

// Populating the guide & remove unwanted data from the returned guides.
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
}); // We put this function here, instead of typing populate in all conrollers. (so we typed it ones here instead of duplicating the code)

// 2) ( Query middleware ) =>  pre / post { .find() } event only {{{ not findById() }}}.
tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
}); // this => preExecuted query

// For { findById() }
tourSchema.pre('findOne', function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// *** for all methods starts with find ***
// (findByIdAndDelete() - findByIdAndUpdate() - find...)
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// tourSchema.post(/^find/, function (retreviedDocs, next) {
//   console.log(retreviedDocs);
//   console.log(`This query takes ${Date.now() - this.start} milliseconds`);
//   next();
// });

// 3) ( Aggrigation middleware ) =>  pre / post { aggrigation happens }.
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// ---------------------------------------------------
// ########################
// ### Virtual populate ###
// ########################

// We have 2 models (tours & reviews), each (review) has a reference on it's parent (tour), but each (tour) does't know it's reviews.
// We didn't make an array of reviews IDs in each (tour) => bcause this will make it has large size after a while. (2 way referencing)
// So to solve that problem to make when I find the tour to get it's reviews also. => ((( Virtual populate )))

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
// Finally use this in the controller => {{{ .populate('reviews') }}}

// ---------------------------------------------------
// ########################
// ### Virtual property ###
// ########################

// Added afetr get data from the database
// In Query (Tour.find({...})) I can't filter using this property because it's not part of the database.
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// ---------------------------------------------------

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
