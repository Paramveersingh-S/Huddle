import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db/client'
import { pods, podMembers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createPod } from './actions'

export default async function PodsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Get user's pods
  const memberships = await db.query.podMembers.findMany({
    where: eq(podMembers.userId, user.id)
  })
  
  const myPodIds = memberships.map(m => m.podId)
  
  // Since db.query doesn't easily support WHERE IN with arrays directly in this simple setup,
  // we'll fetch all pods and filter (fine for MVP). 
  // In production, we'd use 'inArray' from drizzle-orm.
  const allPods = await db.select().from(pods)
  const userPods = allPods.filter(p => myPodIds.includes(p.id))
  const publicPods = allPods.filter(p => p.isPublic && !myPodIds.includes(p.id))

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Savings Pods</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="font-semibold shadow-lg shadow-primary/20 active:scale-95 transition-transform">
              Create a Pod
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-background border-border">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl tracking-tight">Create a Pod</DialogTitle>
              <DialogDescription>
                Start a group savings challenge with friends.
              </DialogDescription>
            </DialogHeader>
            <form action={createPod} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Pod Name</Label>
                <Input id="name" name="name" placeholder="e.g. Goa Trip 2026" required className="bg-surface" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal_title">What are we saving for?</Label>
                <Input id="goal_title" name="goal_title" placeholder="Flight & Hotel" required className="bg-surface" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_amount">Total Target Amount (₹)</Label>
                <Input id="target_amount" name="target_amount" type="number" step="0.01" required className="bg-surface" />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="is_public" name="is_public" className="accent-primary w-4 h-4" />
                <Label htmlFor="is_public">Make this pod public</Label>
              </div>
              <Button type="submit" className="w-full font-bold shadow-lg shadow-primary/20">Create Pod</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-heading font-semibold text-secondary">My Pods</h2>
        {userPods.length === 0 ? (
          <Card className="bg-surface border-border p-8 text-center">
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">You haven't joined any pods yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userPods.map(pod => (
              <Card key={pod.id} className="bg-surface border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="font-heading">{pod.name}</CardTitle>
                  <CardDescription>Saving for: {pod.goalTitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-heading text-primary">₹{parseFloat(pod.targetAmount).toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total Goal</div>
                </CardContent>
                <CardFooter>
                  <Link href={`/pods/${pod.id}`} className="w-full">
                    <Button variant="outline" className="w-full border-border hover:bg-secondary/10 hover:text-secondary">View Pod</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {publicPods.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-border/50">
          <h2 className="text-xl font-heading font-semibold text-accent">Discover Public Pods</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {publicPods.map(pod => (
              <Card key={pod.id} className="bg-surface/50 border-border border-dashed">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">{pod.name}</CardTitle>
                  <CardDescription>Target: ₹{parseFloat(pod.targetAmount).toFixed(2)}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link href={`/pods/${pod.id}`} className="w-full">
                    <Button variant="secondary" className="w-full bg-accent/20 text-accent hover:bg-accent/30">Preview & Join</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
