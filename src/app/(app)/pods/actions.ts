'use server'

import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db/client'
import { pods, podMembers, podContributions } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'

export async function createPod(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const name = formData.get('name') as string
  const goalTitle = formData.get('goal_title') as string
  const targetAmount = parseFloat(formData.get('target_amount') as string)
  const isPublic = formData.get('is_public') === 'on'

  // Insert Pod
  const [newPod] = await db.insert(pods).values({
    name,
    goalTitle,
    targetAmount: targetAmount.toString(),
    isPublic,
    createdBy: user.id
  }).returning()

  // Add creator as member
  await db.insert(podMembers).values({
    podId: newPod.id,
    userId: user.id
  })

  revalidatePath('/pods')
}

export async function joinPod(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const podId = formData.get('pod_id') as string

  await db.insert(podMembers).values({
    podId,
    userId: user.id
  })

  revalidatePath('/pods')
  revalidatePath(`/pods/${podId}`)
}

export async function addContribution(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const podId = formData.get('pod_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const note = formData.get('note') as string

  await db.insert(podContributions).values({
    podId,
    userId: user.id,
    amount: amount.toString(),
    note
  })

  revalidatePath(`/pods/${podId}`)
}
