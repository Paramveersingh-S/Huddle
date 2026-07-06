import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db/client'
import { transactions, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Flame } from 'lucide-react'

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
    <div className="space-y-8 max-w-2xl mx-auto pt-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-heading font-bold tracking-tight">Your Weekly Recap</h1>
        <p className="text-muted-foreground">Share your money vibe with the squad.</p>
      </div>

      <div className="relative group">
        {/* Shareable Card Area */}
        <Card className="bg-gradient-to-br from-surface to-background border-border overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl -z-10 -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 p-32 bg-secondary/10 rounded-full blur-3xl -z-10 -ml-16 -mb-16"></div>
          
          <CardHeader className="text-center pb-2 pt-8">
            <div className="font-heading font-bold text-xl tracking-widest text-primary/80 mb-4 uppercase">HUDDLE</div>
            <CardTitle className="text-2xl">{profile?.displayName || profile?.username}'s Vibe</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-8 py-8 text-center">
            <div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Total Splurged</div>
              <div className="text-7xl font-bold font-heading">₹{totalSpend.toFixed(0)}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/50 p-6 rounded-2xl border border-border/50">
                <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Top Category</div>
                <div className="text-2xl font-bold font-heading capitalize text-secondary">{topCategory ? topCategory[0] : 'None'}</div>
              </div>
              <div className="bg-background/50 p-6 rounded-2xl border border-border/50">
                <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Current Streak</div>
                <div className="text-2xl font-bold font-heading text-warning flex items-center justify-center gap-2">
                  <Flame className="w-8 h-8 fill-warning stroke-warning" /> {profile?.currentStreak || 0}
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="justify-center border-t border-border/20 pt-6 pb-8">
            <div className="text-sm font-medium text-muted-foreground opacity-50">huddle.app/recap</div>
          </CardFooter>
        </Card>
      </div>

      <Button className="w-full font-bold text-lg h-14 shadow-lg shadow-primary/20 active:scale-95 transition-transform rounded-2xl">
        Share to Instagram Story
      </Button>
    </div>
  )
}
