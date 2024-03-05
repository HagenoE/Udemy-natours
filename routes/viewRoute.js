import { Router } from 'express'
import { isLogged, isLoggedIn } from '../controller/authController.js'
import { getAccount, getLogin, getMyTours, getOverview, getSignup, getTour } from '../controller/viewsController.js'
import catchAsync from "../utils/catchAsync.js"
const viewRouter = Router()

viewRouter.use(isLoggedIn)

viewRouter.get('/', isLoggedIn, getOverview)
viewRouter.get('/tours/:tourSlug', isLoggedIn, getTour)

viewRouter.get('/login', isLoggedIn, getLogin)

viewRouter.get('/signup', isLoggedIn, getSignup)
viewRouter.get('/me', isLogged, getAccount)
viewRouter.get('/my-tours', //catchAsync(createBookingCheckout), 
  isLogged, getMyTours)

export default viewRouter