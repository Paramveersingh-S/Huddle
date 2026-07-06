import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { completeOnboarding } from './actions'

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg border-primary/20 shadow-[0_0_15px_rgba(184,255,60,0.1)]">
        <CardHeader>
          <CardTitle className="text-2xl font-heading tracking-tight">Welcome to Huddle</CardTitle>
          <CardDescription>Let's personalize your AI coach and set your first goal.</CardDescription>
        </CardHeader>
        <form action={completeOnboarding}>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">What's your money vibe?</Label>
              <RadioGroup defaultValue="playful" name="money_vibe" className="flex flex-col space-y-2 mt-2">
                <div className="flex items-center space-x-3 space-y-0 bg-surface border border-border p-3 rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="playful" id="vibe-playful" className="text-primary border-primary" />
                  <Label htmlFor="vibe-playful" className="font-medium cursor-pointer flex-1">Playful & encouraging (Default)</Label>
                </div>
                <div className="flex items-center space-x-3 space-y-0 bg-surface border border-border p-3 rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="blunt" id="vibe-blunt" className="text-primary border-primary" />
                  <Label htmlFor="vibe-blunt" className="font-medium cursor-pointer flex-1">Blunt & direct</Label>
                </div>
                <div className="flex items-center space-x-3 space-y-0 bg-surface border border-border p-3 rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="nerdy" id="vibe-nerdy" className="text-primary border-primary" />
                  <Label htmlFor="vibe-nerdy" className="font-medium cursor-pointer flex-1">Detail-oriented & nerdy</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-border/50">
              <Label className="text-base font-semibold">Set your first personal savings goal</Label>
              <div className="space-y-2">
                <Label htmlFor="goal_title" className="text-muted-foreground">Goal Title</Label>
                <Input id="goal_title" name="goal_title" placeholder="e.g. New iPhone" required className="bg-surface" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal_amount" className="text-muted-foreground">Target Amount</Label>
                <Input id="goal_amount" name="goal_amount" type="number" placeholder="1000" min="1" step="0.01" required className="bg-surface" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full font-bold text-base shadow-lg shadow-primary/20 active:scale-95 transition-transform" type="submit">Start Huddling</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
