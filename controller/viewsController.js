import Tour from "../models/tourModel.js"
import catchAsync from "../utils/catchAsync.js"
import AppError from '../utils/appError.js'
import Booking from "../models/bookingModel.js";
import { log } from "console";

export const getOverview = catchAsync(async (req, res, next) => {

  const tours = await Tour.find();

  return res.status(200).render('overview', {
    title: 'All Tours',
    tours
  })
})

export const getTour = catchAsync(async (req, res, next) => {

  const { tourSlug } = req.params;

  const tour = await Tour.findOne({ slug: tourSlug }).populate(
    {
      path: 'reviews',
      fields:
        'review rating user'
    })

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404))
  }

  return res.status(200).set(
    'Content-Security-Policy',
    "default-src 'self' https:\/\/*.mapbox.com https://js.stripe.com/v3/ ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
  ).render('tour', {
    title: tour.name,
    tour
  })
})

export const getLogin = (req, res) => {

  return res.status(200).set(
    'Content-Security-Policy',
    "connect-src 'self' https://cdnjs.cloudflare.com"
  )
    .render('login', {
      title: 'Log into your account'
    })
};

export const getSignup = (req, res) => {
  return res.status(200).set(
    'Content-Security-Policy',
    "connect-src 'self' https://cdnjs.cloudflare.com"
  ).render('signup', {
    title: 'Create your account'
  })
}

export const getAccount = (req, res) => {
  return res.status(200).render('account', {
    title: 'Your account'
  })
}

export const getMyTours = async (req, res, next) => {

  const bookings = await Booking.find({ user: req.user.id })

  const tourIds = bookings.map(el => el.tour)

  const tours = await Tour.find({ _id: { $in: tourIds } })


  res.status(200).render('overview', {
    title: 'Booking tours',
    tours
  })
}