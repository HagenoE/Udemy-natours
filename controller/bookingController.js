import stripe from 'stripe'
import Tour from "../models/tourModel.js"
import AppError from "../utils/appError.js"
import Booking from '../models/bookingModel.js';
import { createOne, deleteOne, getAll, getOne, updateOne } from './handlerFactory.js';
import User from '../models/userModel.js';


const stripeObject = stripe(process.env.STRIPE_SECRET_KEY);

export const getCheckoutSession = async (req, res, next) => {

  const { tourId } = req.params;

  const tour = await Tour.findById(tourId);

  const session = await stripeObject.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-tours/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
    mode: 'payment',
    customer_email: req.user.email,
    client_reference_id: tourId,
    line_items: [{
      price_data: {
        product_data: {
          name: `${tour.name} Tour`,
          description: tour.summary,
          images: [],
        },

        unit_amount: tour.price * 100,
        currency: 'usd',
      },
      quantity: 1
    }]
  })

  return res.status(200).json({
    status: 'success',
    session
  })
}

export const createBookingCheckout = async session => {

  const tour = client_reference_id;
  const user = await User.findOne({ email: customer_emailr }).id
  const price = session.line_items[0].unit_amount / 1000


  await Booking.create({ tour, user, price })
}

export const webHookCheckout = (req, res, next) => {
  const endpointSecret = process.env.STRIPE_ENDPOINTSECRET;
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);

  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      break;
    case 'checkout.session.completed':
      createBookingCheckout(event.data.object)
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  return res.send();
};

export const getAllBooking = getAll(Booking)
export const createBooking = createOne(Booking)
export const getOneBooking = getOne(Booking)
export const updateBooking = updateOne(Booking)
export const deleteBooking = deleteOne(Booking)