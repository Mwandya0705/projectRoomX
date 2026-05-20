import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'dummy_stripe_key_for_vercel_build'

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
})

