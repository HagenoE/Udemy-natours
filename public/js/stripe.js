import axios from 'axios'
import { showAlert } from './alert';

export const bookTour = async (tourId) => {

  try {

    const stripe = Stripe("pk_test_51OoUANBddAGQOxSTxLR8kEAz8bylRybfFyMSZhelG9kQFnSCOPsIE70fso3dJX4lJmbLdRfogv1s3kPVlWlsJMGz00V92vB6Vi");

    const session = await axios.get(`/api/v1/bookings/checkout-session/${tourId}`);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {

    showAlert('error', error)
  }
}