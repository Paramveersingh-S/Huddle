import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db/client'
import { transactions, profiles } from '@/lib/db/schema'
import { eq, gte, and } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { ShareableRecapsCard } from './ShareableRecapsCard'

export default async function RecapsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const userProfile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id)
  })

  // Get transactions from the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const isoDate = sevenDaysAgo.toISOString().split('T')[0]

  const recentTxs = await db.select().from(transactions).where(
    and(
      eq(transactions.userId, user.id),
      gte(transactions.occurredAt, isoDate)
    )
  )

  const totalSpend = recentTxs.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0)
  
  // Calculate top category
  const categoryTotals: Record<string, number> = {}
  recentTxs.forEach(tx => {
    if (!tx.category) return
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + parseFloat(tx.amount || '0')
  })
  
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])
  const topCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : 'nothing'
  const topCategorySpend = sortedCategories.length > 0 ? sortedCategories[0][1] : 0

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Weekly Vibe Check</h1>
        <p className="text-muted-foreground mt-1">Your spending personality, summarized.</p>
      </div>

      <ShareableRecapsCard 
        username={userProfile?.username || 'User'}
        totalSpend={totalSpend}
        topCategory={topCategory}
      />
    </div>
  )
}
