import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db/client'
import { transactions, profiles } from '@/lib/db/schema'
import { eq, gte, and } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

  // Determine Vibe
  let vibe = "Zen Master 🧘"
  let vibeDesc = "You barely spent a dime this week. Monk status achieved."
  let gradient = "from-[#ff00ff] to-primary"

  if (totalSpend > 5000) {
    vibe = "Big Spender 💸"
    vibeDesc = "You were making it rain this week!"
    gradient = "from-destructive to-warning"
  } else if (topCategory === 'food') {
    vibe = "Foodie 🍔"
    vibeDesc = "Your stomach dictates your wallet."
    gradient = "from-warning to-primary"
  } else if (topCategory === 'shopping') {
    vibe = "Retail Therapist 🛍️"
    vibeDesc = "Treat yo self was the motto this week."
    gradient = "from-[#ff00ff] to-accent"
  } else if (totalSpend > 0) {
    vibe = "Balanced ⚖️"
    vibeDesc = "Keeping things steady and smooth."
    gradient = "from-primary to-secondary"
  }

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Weekly Vibe Check</h1>
        <p className="text-muted-foreground mt-1">Your spending personality, summarized.</p>
      </div>

      {/* Instagram-Story Style Card */}
      <Card className={`overflow-hidden border-0 bg-gradient-to-br ${gradient} shadow-2xl shadow-primary/20 relative aspect-[9/16] text-black`}>
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 p-8 flex flex-col justify-between">
          
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-bold tracking-wide uppercase shadow-sm border border-white/20">
              <Sparkles className="w-4 h-4" /> Weekly Recap
            </div>
            <h2 className="text-white font-heading font-black text-4xl leading-none tracking-tight drop-shadow-md">
              {userProfile?.username}'s<br/>Vibe Check
            </h2>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/40 transform -rotate-2 hover:rotate-0 transition-transform">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">The Verdict</div>
              <div className="text-3xl font-black font-heading text-gray-900 leading-none mb-2">{vibe}</div>
              <p className="text-gray-600 font-medium leading-snug">{vibeDesc}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 text-white">
                <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Total Spent</div>
                <div className="text-2xl font-black font-heading">₹{totalSpend.toFixed(0)}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 text-white">
                <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Top Category</div>
                <div className="text-2xl font-black font-heading capitalize truncate">{topCategory}</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-center text-white/70 font-bold text-sm tracking-widest uppercase">
            HuddleApp.com
          </div>
        </div>
      </Card>

      <div className="flex gap-4">
        <Button className="w-full font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform" size="lg">
          <Share2 className="w-4 h-4 mr-2" /> Share to Instagram
        </Button>
      </div>
    </div>
  )
}
