import { Router } from 'express';

import {
  getAllTours, addNewTour, getOneTour, deleteTour,
  aliasTopTours, getTourStats, getMonthlyPlan, updateTour,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
} from '../controller/tourController.js';
import reviewRouter from './reviewRoute.js';

import catchAsync from '../utils/catchAsync.js';
import { isLogged, restrictTo } from '../controller/authController.js ';


const tourRouter = Router();

// tourRouter.param('id',checkId);

tourRouter.use('/:tourId/reviews', reviewRouter)

tourRouter.route('/top5-cheap')
  .get(aliasTopTours, catchAsync(getAllTours));

tourRouter.route('/tour-stats')
  .get(catchAsync(getTourStats));

tourRouter.route('/monthly-plan/:year')
  .get(isLogged, restrictTo('admin', 'lead-guide', 'guide'), catchAsync(getMonthlyPlan));

tourRouter.route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(catchAsync(getToursWithin))
///api/v1/tour/tours-within/100/center/34.111745,-118.113491/unit/km 
tourRouter.route('/distances/:latlng/unit/:unit')
  .get(catchAsync(getDistances))


tourRouter.route('/')
  .get(catchAsync(getAllTours))
  .post(isLogged, restrictTo('admin', 'lead-guide'), catchAsync(addNewTour));

tourRouter.route('/:id')
  .get(catchAsync(getOneTour))
  .patch(isLogged, restrictTo('admin', 'lead-guide'), uploadTourImages, catchAsync(resizeTourImages), catchAsync(updateTour))
  .delete(isLogged, restrictTo('admin', 'lead-guide'), catchAsync(deleteTour));

export default tourRouter;
