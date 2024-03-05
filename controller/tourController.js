import multer from 'multer';
import sharp from 'sharp';

import Tour from '../models/tourModel.js';
import AppError from '../utils/appError.js';
import { createOne, deleteOne, getAll, getOne, updateOne } from './handlerFactory.js';

export const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
  next();
};

export const getAllTours = getAll(Tour)
export const getOneTour = getOne(Tour, { path: 'reviews' })
export const addNewTour = createOne(Tour)
export const updateTour = updateOne(Tour)
export const deleteTour = deleteOne(Tour);


export const getTourStats = async (req, res) => {
  const stat = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort:
      {
        averagePrice: 1,
      },
    },

  ]);

  return res.status(200).json({
    status: 'success',
    data: stat,
  });
};
export const getMonthlyPlan = async (req, res) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      $limit: 12,
    },
  ]);

  return res.status(200).json({
    status: 'success',
    data: plan,
  });
};

export const getToursWithin = async (req, res, next) => {

  const { distance, latlng, unit } = req.params
  const [lat, lng] = latlng.split(',')

  if (!lat || !lng) next(new AppError('Veuillez fournir des coordonnées géographiques au format lat,lng', 400))

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1

  const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  })
}

export const getDistances = async (req, res, next) => {

  const { latlng, unit } = req.params
  const [lat, lng] = latlng.split(',')

  if (!lat || !lng) next(new AppError('Veuillez fournir des coordonnées géographiques au format lat,lng', 400))

  const distances = await Tour.aggregate([{
    $geoNear: {
      near: {
        type: 'Point',
        coordinates: [lng * 1, lat * 1]
      },
      distanceField: 'distance',
      distanceMultiplier: unit === 'mi' ? 0.000621371 : 0.001
    }
  },
  {
    $project: {
      distance: 1,
      name: 1
    }
  }
  ])

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  })

}



const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError('Not an image', 400), false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

export const uploadTourImages = upload.fields([
  {
    name: 'imageCover', maxCount: 1
  },
  {
    name: 'images', maxCount: 3
  }
])
// upload.single('image');
// upload.array('images', 5);

export const resizeTourImages = async (req, res, next) => {

  if (!req.files.imageCover
    || !req.files.images) return next()


  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-image-cover.jpeg`

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`)

  req.body.images = []
  await Promise.all(
    req.file.images.forEach(async (file, index) => {
      const filename = `tour-${req.params.id}-${Date.now()}-image-${index + 1}.jpeg`

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`)

      req.body.images.push(filename)
    })
  );



  return next()
}
