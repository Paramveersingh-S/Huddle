import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db/client'
import { pods, podMembers, podContributions, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { joinPod, addContribution } from '../actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function PodDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in')

  const { id } = await params
  const podId = id
  
  const [pod] = await db.select().from(pods).where(eq(pods.id, podId))
  if (!pod) redirect('/pods')

  const members = await db.select().from(podMembers).where(eq(podMembers.podId, podId))
  const isMember = members.some(m => m.userId === user.id)

  const contributions = await db.select().from(podContributions).where(eq(podContributions.podId, podId))
  
  // Aggregate contributions by user for leaderboard
  const leaderBoardMap: Record<string, number> = {}
  let totalSaved = 0
  
  contributions.forEach(c => {
    const amt = parseFloat(c.amount)
    totalSaved += amt
    if (!leaderBoardMap[c.userId]) leaderBoardMap[c.userId] = 0
    leaderBoardMap[c.userId] += amt
  })

  // Get profiles for members
  const memberProfiles = await Promise.all(
    members.map(async m => {
      const [p] = await db.select().from(profiles).where(eq(profiles.id, m.userId))
      return {
        ...p,
        contributed: leaderBoardMap[m.userId] || 0
      }
    })
  )

  // Sort by contribution
  memberProfiles.sort((a, b) => b.contributed - a.contributed)

  const target = parseFloat(pod.targetAmount)
  const progress = target > 0 ? (totalSaved / target) * 100 : 0

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">{pod.name}</h1>
          <p className="text-muted-foreground mt-1">Goal: {pod.goalTitle}</p>
        </div>
        {!isMember && (
          <form action={joinPod}>
            <input type="hidden" name="pod_id" value={pod.id} />
            <Button type="submit" className="font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform">Join Pod</Button>
          </form>
        )}
      </div>

      <Card className="bg-surface border-border overflow-hidden relative">
        <div className="absolute top-0 right-0 p-24 bg-primary/5 rounded-full blur-3xl -z-10 -mr-12 -mt-12"></div>
        <CardHeader>
          <CardTitle className="text-lg">Group Progress</CardTitle>
          <CardDescription>We're saving ₹{target.toFixed(2)} together</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-lg font-bold font-heading">
            <span className="text-primary">₹{totalSaved.toFixed(2)} saved</span>
            <span className="text-foreground">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-4 bg-background border border-border" />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-heading font-semibold">Leaderboard</h2>
          <div className="space-y-3">
            {memberProfiles.map((p, i) => (
              <Card key={p.id} className="bg-surface/50 border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="font-heading font-bold text-muted-foreground w-4 text-center">{i + 1}</div>
                    <Avatar>
                      <AvatarImage src={p.avatarUrl || ''} />
                      <AvatarFallback className="bg-secondary/20 text-secondary font-bold">{p.displayName?.substring(0,2).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{p.displayName || p.username}</div>
                      <div className="text-xs text-muted-foreground capitalize">Vibe: {p.moneyVibe}</div>
                    </div>
                  </div>
                  <div className="font-bold text-lg font-heading text-primary">
                    ₹{p.contributed.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {isMember && (
          <div className="space-y-4">
            <h2 className="text-xl font-heading font-semibold">Log Contribution</h2>
            <Card className="bg-surface border-border">
              <form action={addContribution}>
                <input type="hidden" name="pod_id" value={pod.id} />
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" required placeholder="500" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note">Note (Optional)</Label>
                    <Input id="note" name="note" placeholder="My share for the flight" className="bg-background" />
                  </div>
                  <Button type="submit" className="w-full font-bold shadow-lg shadow-primary/20">Add to Pot</Button>
                </CardContent>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
