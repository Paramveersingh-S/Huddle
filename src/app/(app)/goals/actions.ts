'use server'

import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db/client'
import { goals } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'

export async function addGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const targetAmount = parseFloat(formData.get('targetAmount') as string)

  await db.insert(goals).values({
    userId: user.id,
    title,
    targetAmount: targetAmount.toString(),
    currentAmount: '0',
    deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
  })

  revalidatePath('/goals')
  revalidatePath('/dashboard')
}
