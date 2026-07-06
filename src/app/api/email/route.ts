import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { WelcomeEmail } from '@/components/emails/WelcomeEmail'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db/client'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key')

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY missing. Mocking email send.')
      return NextResponse.json({ success: true, mock: true })
    }

    const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id))
    const userName = profile?.displayName || profile?.username || 'Bestie'

    const data = await resend.emails.send({
      from: 'Huddle Team <hello@huddle.com>',
      to: [user.email],
      subject: 'Welcome to Huddle! 🚀',
      react: WelcomeEmail({ userName }) as React.ReactElement,
    })

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Email sending error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
