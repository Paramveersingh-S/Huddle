import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/utils/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia' as any,
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      // Mock mode for local dev if keys not set
      console.warn('STRIPE_SECRET_KEY is missing. Returning a mock URL.')
      return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?mock_upgrade=true` })
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Huddle Pro Subscription',
              description: 'Unlimited AI scans, Custom Coach vibes, Advanced Analytics.',
            },
            unit_amount: 19900, // ₹199.00
            recurring: { interval: 'month' }
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard?upgrade=success`,
      cancel_url: `${origin}/upgrade?upgrade=canceled`,
      client_reference_id: user.id, // Very important to map back to user in webhook
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Error in checkout:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
