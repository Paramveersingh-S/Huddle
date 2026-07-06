import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db/client'
import { goals } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { GoalEntryDialog } from '@/components/GoalEntryDialog'

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const userGoals = await db.query.goals.findMany({
    where: eq(goals.userId, user.id)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Savings Goals</h1>
        <GoalEntryDialog>
          <Button className="font-semibold shadow-lg shadow-primary/20 active:scale-95 transition-transform">
            Create Goal
          </Button>
        </GoalEntryDialog>
      </div>

      {userGoals.length === 0 ? (
        <Card className="bg-surface/50 border-border p-12 text-center">
          <CardContent className="space-y-4">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-2xl font-heading font-semibold">No goals yet</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">Set a target and start tracking your savings towards your dreams!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {userGoals.map(goal => {
            const current = parseFloat(goal.currentAmount || '0')
            const target = parseFloat(goal.targetAmount || '0')
            const progress = target > 0 ? (current / target) * 100 : 0

            return (
              <Card key={goal.id} className="bg-surface border-border overflow-hidden relative">
                <div className="absolute top-0 right-0 p-16 bg-primary/5 rounded-full blur-2xl -z-10 -mr-8 -mt-8"></div>
                <CardHeader>
                  <CardTitle className="font-heading text-xl">{goal.title}</CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">Target: ₹{target.toFixed(2)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-foreground">₹{current.toFixed(2)} saved</span>
                    <span className="text-primary">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-3 rounded-full bg-background border border-border" />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
