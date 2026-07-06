import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function UpgradePage() {
  return (
    <div className="space-y-16 max-w-5xl mx-auto py-12 px-4">
      <div className="text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight">Level up your <span className="text-primary">Huddle</span>.</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get unlimited AI receipt scanning, advanced analytics, and custom coach personalities.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="bg-surface border-border flex flex-col p-2">
          <CardHeader>
            <CardTitle className="text-3xl font-heading">Huddle Free</CardTitle>
            <CardDescription className="text-base">Everything you need to start saving.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6 pt-4">
            <div className="text-5xl font-bold font-heading">₹0<span className="text-xl text-muted-foreground font-sans font-medium">/mo</span></div>
            <ul className="space-y-4 pt-4">
              <li className="flex items-center gap-3">
                <span className="text-primary text-xl">✓</span> Up to 15 AI receipt scans/mo
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary text-xl">✓</span> Basic Money Coach
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary text-xl">✓</span> Join unlimited Pods
              </li>
            </ul>
          </CardContent>
          <CardFooter className="pt-8">
            <Button variant="outline" className="w-full font-bold border-border/50 h-14 rounded-xl opacity-50" disabled>Current Plan</Button>
          </CardFooter>
        </Card>

        <Card className="bg-surface border-primary relative overflow-hidden flex flex-col shadow-[0_0_50px_rgba(184,255,60,0.15)] p-2">
          <div className="absolute top-0 right-0 bg-primary text-black text-xs font-bold px-4 py-2 rounded-bl-xl tracking-wider">POPULAR</div>
          <CardHeader>
            <CardTitle className="text-3xl text-primary font-heading">Huddle Pro</CardTitle>
            <CardDescription className="text-base">For serious savers and hustlers.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6 pt-4">
            <div className="text-5xl font-bold font-heading">₹199<span className="text-xl text-muted-foreground font-sans font-medium">/mo</span></div>
            <ul className="space-y-4 pt-4">
              <li className="flex items-center gap-3">
                <span className="text-primary text-xl">✓</span> Unlimited AI receipt scans
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary text-xl">✓</span> Priority AI Coach response time
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary text-xl">✓</span> Custom Coach personalities
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary text-xl">✓</span> Advanced spending analytics
              </li>
            </ul>
          </CardContent>
          <CardFooter className="pt-8">
            <Button className="w-full font-bold shadow-[0_0_20px_rgba(184,255,60,0.4)] active:scale-95 transition-all hover:shadow-[0_0_30px_rgba(184,255,60,0.6)] text-lg h-14 rounded-xl">
              Upgrade to Pro
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
