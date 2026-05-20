import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!

if (!stripeSecretKey) {
  throw new Error('Missing Stripe secret key')
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
})

