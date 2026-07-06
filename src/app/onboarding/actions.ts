'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db/client'
import { profiles, goals } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const vibe = formData.get('money_vibe') as string
  const goalTitle = formData.get('goal_title') as string
  const goalAmount = parseFloat(formData.get('goal_amount') as string)

  // Update profile
  await db.update(profiles)
    .set({ moneyVibe: vibe })
    .where(eq(profiles.id, user.id))

  // Create first goal
  await db.insert(goals).values({
    userId: user.id,
    title: goalTitle,
    targetAmount: goalAmount.toString(),
    currentAmount: '0',
  })

  redirect('/dashboard')
}
