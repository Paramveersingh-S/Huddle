import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db/client'
import { transactions, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { ShareableRecap } from './ShareableRecap'

export default async function RecapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in')

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id))
  const txs = await db.select().from(transactions).where(eq(transactions.userId, user.id))

  const totalSpend = txs.reduce((acc, tx) => acc + parseFloat(tx.amount || '0'), 0)
  
  // Find top category
  const categories: Record<string, number> = {}
  txs.forEach(tx => {
    const amt = parseFloat(tx.amount)
    categories[tx.category] = (categories[tx.category] || 0) + amt
  })
  const topCategory = Object.entries(categories).sort((a,b) => b[1] - a[1])[0]

  return (
    <div className="space-y-8 max-w-2xl mx-auto pt-6 flex flex-col items-center">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-heading font-bold tracking-tight">Your Weekly Recap</h1>
        <p className="text-muted-foreground">Share your money vibe with the squad.</p>
      </div>

      <ShareableRecap 
        displayName={profile?.displayName || profile?.username || 'User'}
        totalSpend={totalSpend}
        topCategory={topCategory ? topCategory[0] : 'None'}
        currentStreak={Number(profile?.currentStreak) || 0}
      />
    </div>
  )
}
