import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db/client'
import { profiles } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BadgeCard } from '@/components/BadgeCard'
import { Flame, Trophy, Star, Shield, Zap, Target } from 'lucide-react'

export default async function StreaksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const userProfile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id)
  })

  // Get top 5 users for leaderboard
  const topProfiles = await db.select().from(profiles).orderBy(desc(profiles.longestStreak)).limit(5)

  const currentStreak = Number(userProfile?.currentStreak || 0)
  const longestStreak = Number(userProfile?.longestStreak || 0)

  const badges: { icon: React.ReactNode, title: string, desc: string, earned: boolean, tier: 'bronze' | 'silver' | 'gold' | 'diamond' }[] = [
    { icon: <Target className="w-6 h-6" />, title: 'First Log', desc: 'Logged your first expense.', earned: true, tier: 'bronze' },
    { icon: <Flame className="w-6 h-6" />, title: '7-Day Streak', desc: 'Maintained a streak for a week.', earned: longestStreak >= 7, tier: 'silver' },
    { icon: <Star className="w-6 h-6" />, title: 'Goal Setter', desc: 'Created your first goal.', earned: true, tier: 'gold' },
    { icon: <Zap className="w-6 h-6" />, title: '30-Day Streak', desc: 'Maintained a streak for a month.', earned: longestStreak >= 30, tier: 'diamond' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">Gamification & Streaks</h1>
        <p className="text-muted-foreground mt-1">Level up your financial discipline.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-surface border-border overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-warning/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Streak</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className={`p-4 rounded-full ${currentStreak > 0 ? 'bg-warning/20 animate-pulse' : 'bg-muted'}`}>
              <Flame className={`w-12 h-12 ${currentStreak > 0 ? 'text-warning fill-warning' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <div className="text-6xl font-bold font-heading">{currentStreak}</div>
              <div className="text-sm font-medium text-muted-foreground mt-1">Days in a row</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Longest Streak</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-primary/20">
              <Trophy className="w-12 h-12 text-primary" />
            </div>
            <div>
              <div className="text-6xl font-bold font-heading">{longestStreak}</div>
              <div className="text-sm font-medium text-muted-foreground mt-1">Personal Best</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-heading font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-secondary" /> Badges & Achievements
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {badges.map((badge, i) => (
              <BadgeCard key={i} {...badge} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-heading font-semibold text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent" /> Global Leaderboard
          </h2>
          <Card className="bg-surface border-border">
            <CardContent className="p-0">
              <ul className="divide-y divide-border/50">
                {topProfiles.map((p, i) => (
                  <li key={p.id} className={`flex items-center justify-between p-4 ${p.id === user.id ? 'bg-primary/5' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="font-bold font-heading text-lg w-6 text-muted-foreground">#{i + 1}</div>
                      <div className="font-medium">{p.username || 'Anonymous'} {p.id === user.id && <span className="text-xs ml-2 bg-primary/20 text-primary px-2 py-0.5 rounded-full">You</span>}</div>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold font-heading">
                      <Flame className="w-4 h-4 text-warning fill-warning" /> {p.longestStreak}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
