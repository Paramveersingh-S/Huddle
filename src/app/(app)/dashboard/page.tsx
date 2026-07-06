import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db/client'
import { profiles, goals, transactions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { TransactionEntryDialog } from '@/components/TransactionEntryDialog'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const userProfile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id)
  })

  const userGoals = await db.query.goals.findMany({
    where: eq(goals.userId, user.id)
  })

  // Calculate actual spend and empty state
  const txs = await db.select().from(transactions).where(eq(transactions.userId, user.id))
  const isFirstTime = txs.length === 0
  
  const totalSpend = txs.reduce((acc, tx) => acc + parseFloat(tx.amount || '0'), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Dashboard</h1>
        <TransactionEntryDialog>
          <Button className="font-semibold shadow-lg shadow-primary/20 active:scale-95 transition-transform">
            Scan a receipt
          </Button>
        </TransactionEntryDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Bento Grid layout */}
        <Card className="col-span-1 lg:col-span-2 bg-surface border-border overflow-hidden relative">
          <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -z-10 -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Spend</CardTitle>
          </CardHeader>
          <CardContent>
            {isFirstTime ? (
              <div className="text-5xl font-bold font-heading text-muted-foreground opacity-50 mt-2">₹0.00</div>
            ) : (
              <div className="text-5xl font-bold font-heading mt-2">₹{totalSpend.toFixed(2)}</div> 
            )}
            <p className="text-sm text-muted-foreground mt-4">
              {isFirstTime ? 'Scan your first receipt to see stats' : `${txs.length} transactions logged`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border overflow-hidden relative">
          <div className="absolute top-0 right-0 p-16 bg-warning/5 rounded-full blur-2xl -z-10 -mr-8 -mt-8"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-heading flex items-center gap-2 mt-2">
              <span className="text-warning text-3xl">🔥</span> {userProfile?.currentStreak || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border overflow-hidden relative">
          <div className="absolute top-0 right-0 p-24 bg-accent/5 rounded-full blur-2xl -z-10 -mr-12 -mt-12"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Next Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-heading truncate mt-2 text-primary">
              {userGoals[0]?.title || 'No goals set'}
            </div>
            <div className="text-sm font-medium text-muted-foreground mt-1 mb-4">
              ₹{userGoals[0]?.currentAmount || 0} / ₹{userGoals[0]?.targetAmount || 0}
            </div>
            <div className="h-2.5 w-full bg-background rounded-full overflow-hidden border border-border">
              <div className="h-full bg-primary transition-all duration-1000 ease-in-out" style={{ width: '0%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {isFirstTime && (
        <Card className="bg-surface/50 border-secondary/20 p-10 text-center flex flex-col items-center justify-center space-y-6 mt-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-secondary/5 via-transparent to-primary/5 pointer-events-none"></div>
          <div className="text-5xl animate-bounce">📸</div>
          <div className="space-y-2">
            <h2 className="text-3xl font-heading font-semibold">Ready to start Huddling?</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-base">
              Log your first expense by scanning a receipt or payment screenshot. We do the boring data entry for you.
            </p>
          </div>
          <TransactionEntryDialog>
            <Button size="lg" className="mt-4 font-bold text-base shadow-[0_0_20px_rgba(184,255,60,0.3)] active:scale-95 transition-all hover:shadow-[0_0_30px_rgba(184,255,60,0.5)]">
              Scan your first receipt
            </Button>
          </TransactionEntryDialog>
        </Card>
      )}
    </div>
  )
}
