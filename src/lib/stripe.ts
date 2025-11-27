// initialzing stripe
import Stripe from 'stripe';
import { SECRET_STRIPE_KEY } from '$env/static/private';

// checking if stripe secret key is set
if (!SECRET_STRIPE_KEY) {
    throw new Error('Stripe secret key is not set');
}

export const stripe = new Stripe(SECRET_STRIPE_KEY);
