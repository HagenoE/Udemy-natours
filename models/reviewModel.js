import mongoose from 'mongoose';
import Tour from './tourModel.js';


const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Ne peut etre vide']
  },
  rating: {
    type: Number,
    default: 3,
    min: [1, 'La note doit etre a 1  au minimum'],
    max: [5, 'La note ne peut excéder 5']
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Le commentaire doit concerner un circuit']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Le commentaire doit etre associe a un utilisateur']
  }
},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  });

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo '
  // })

  this.populate({
    path: 'user',
    select: 'name photo '
  })
  next();
});

reviewSchema.index({
  tour: 1,
  user: 1
}, { unique: true })

reviewSchema.statics.calcAverageRatings = async function (tourId) {

  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats.length !== 0 ? stats[0].nRating : 0,
    ratingsAverage: stats.length !== 0 ? stats[0].avgRating : 3
  })
}

reviewSchema.post('save', function () {

  this.constructor.calcAverageRatings(this.tour);

});

reviewSchema.pre(/^findOneAnd/, async function (next) {

  this.r = await this.findOne()

  next()
})

reviewSchema.post(/^findOneAnd/, async function () {

  await this.r.constructor.calcAverageRatings(this.r.tour)

})


const Review = mongoose.model('Review', reviewSchema);

export default Review;


