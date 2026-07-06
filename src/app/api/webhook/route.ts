import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db/client'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    let event: Stripe.Event

    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } else if (!process.env.STRIPE_SECRET_KEY) {
      // Mock mode for local dev
      event = JSON.parse(body)
    } else {
      return NextResponse.json({ error: 'Webhook secret missing' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.client_reference_id

      if (userId) {
        // Upgrade the user to 'pro' tier
        await db.update(profiles)
          .set({ subscriptionTier: 'pro' })
          .where(eq(profiles.id, userId))
        
        console.log(`Successfully upgraded user ${userId} to Pro`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 })
  }
}
