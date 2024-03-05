import { Router } from 'express'
import catchAsync from '../utils/catchAsync.js'
import { isLogged, restrictTo } from '../controller/authController.js'
import { getAllReview, addNewReview, deleteReview, updateReview, setTourUserIds, getOneReview } from '../controller/reviewController.js'

const reviewRouter = Router({ mergeParams: true })

reviewRouter.use(isLogged)

reviewRouter.route('/')
  .get(catchAsync(getAllReview))
  .post(restrictTo('user'), setTourUserIds, catchAsync(addNewReview))

reviewRouter.route('/:id')
  .get(catchAsync(getOneReview))
  .patch(restrictTo('user', 'admin'), catchAsync(updateReview))
  .delete(restrictTo('user', 'admin'), catchAsync(deleteReview))



export default reviewRouter