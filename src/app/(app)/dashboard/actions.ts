'use server'

import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db/client'
import { transactions, profiles } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { sql } from 'drizzle-orm'

export async function addTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const merchant = formData.get('merchant') as string
  const amount = parseFloat(formData.get('amount') as string)
  const category = formData.get('category') as string
  const occurredAt = formData.get('occurred_at') as string
  const source = (formData.get('source') as string) || 'manual'

  await db.insert(transactions).values({
    userId: user.id,
    merchant,
    amount: amount.toString(),
    category,
    occurredAt,
    source,
    currency: 'INR',
  })

  // Simple streak logic: increment on transaction
  await db.execute(sql`
    UPDATE profiles
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1)
    WHERE id = ${user.id}
  `)

  revalidatePath('/dashboard')
}
