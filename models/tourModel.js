/* eslint-disable func-names */
import mongoose from 'mongoose';
import slugify from 'slugify';
// import { User } from './userModel.js'

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le sejour doit avoir un nom'],
    unique: true,
    trim: true,
    maxlength: [40, 'Le nom ne peut depasser 40 caracteres'],
    minlength: [10, 'Le nom doit avoir au moins 10 caracteres'],
  },
  price: {
    type: Number,
    required: [true, 'Le sejour doit avoir un prix'],
  },
  priceDiscount: {
    type: Number,
    validate: {

      validator(val) {
        return val < this.price;
      },
      message: 'La reduction {{ VALUE }} doit etre inferieri au prix ',
    },
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'La note doit au moins etre de 1.0'],
    max: [5, 'La note doit au plus etre de 5.0 '],
    set: val => val.toFixed(1)
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number,
    required: [true, 'Le sejour doit avoir une duree'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'Le sejour doit avoir un nombre de personne maximal'],
  },
  difficulty: {
    type: String,
    required: [true, 'Le sejour doit avoir un niveau de difficulte'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'La difficulte est soit : easy, medium, difficult',
    },
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'Le sejour doit avoir un resume'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'Le sejour doit avoir une image'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
  slug: String,
  secretTour: {
    type: Boolean,
    default: false,
  },
  startLocation: {
    // geoJson
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: [Number],
    adress: String,
    description: String,
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      adress: String,
      description: String,
      day: Number,
    },
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

tourSchema.index({ price: 1, ratingsAverage: -1 })
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: '2dsphere' })

tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save'), async function (next) {
//   const guides = this.guides.map(async id => await User.find(id))
//   this.guides = await Promise.all(guides);
//   next()
// }


tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v-passwordChangedAt'
  })
  next();
});

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);

export default Tour;
