import { Router } from 'express';
import { isLogged, restrictTo } from '../controller/authController.js';
import { createBooking, deleteBooking, getAllBooking, getCheckoutSession, getOneBooking, updateBooking } from '../controller/bookingController.js'
import catchAsync from "../utils/catchAsync.js"

const bookingRouter = Router();

bookingRouter.use(isLogged)

bookingRouter.get('/checkout-session/:tourId', catchAsync(getCheckoutSession))


bookingRouter.use(restrictTo('admin', 'lead-guide'))
bookingRouter.route('/')
  .get(getAllBooking)
  .post(createBooking)

bookingRouter.route('/:id')
  .get(getOneBooking)
  .patch(updateBooking)
  .delete(deleteBooking)


export default bookingRouter