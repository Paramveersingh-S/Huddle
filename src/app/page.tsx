import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Flame, Skull } from 'lucide-react'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-6 lg:px-14 h-20 flex items-center border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/assets/huddle.png" alt="Huddle Logo" className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(184,255,60,0.3)]" />
        </div>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link href="/sign-in" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
            Login
          </Link>
          <Link href="/sign-up">
            <Button className="font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform rounded-full px-6">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden pt-12 pb-24">
        {/* Decorative background blurs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-primary/10 rounded-full blur-[100px] md:blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-secondary/10 rounded-full blur-[80px] md:blur-[100px] -z-10 pointer-events-none"></div>

        <div className="space-y-8 max-w-4xl mx-auto z-10">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
            <span className="flex h-2.5 w-2.5 rounded-full bg-primary mr-2.5 animate-pulse"></span>
            Huddle V1 is now live
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-heading font-black tracking-tighter leading-[1.1]">
            Finance for the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-300% animate-gradient">Terminally Online.</span>
          </h1>
          
          <p className="max-w-[600px] mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Stop pretending you use spreadsheets. Scan receipts with AI, join savings pods with your squad, and get roasted by your AI money coach.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto font-bold text-lg h-14 px-8 rounded-2xl shadow-[0_0_30px_rgba(184,255,60,0.3)] hover:shadow-[0_0_50px_rgba(184,255,60,0.5)] active:scale-95 transition-all text-black">
                Start Saving (For Free)
              </Button>
            </Link>
            <Link href="/sign-in" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold text-lg h-14 px-8 rounded-2xl border-border/50 hover:bg-surface active:scale-95 transition-all">
                Login to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Mockup / Dashboard Preview */}
        <div className="w-full max-w-5xl mx-auto mt-24 relative hidden md:block">
          <div className="absolute -inset-1 bg-gradient-to-tr from-primary/30 via-secondary/20 to-accent/30 rounded-3xl blur-2xl opacity-30 z-0"></div>
          <div className="relative bg-surface border border-border/50 rounded-3xl shadow-2xl overflow-hidden z-10">
            <div className="h-12 border-b border-border/50 bg-background/50 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="p-8 grid md:grid-cols-3 gap-6 bg-background/80 backdrop-blur-sm text-left">
              <div className="md:col-span-2 space-y-6">
                <div className="h-40 rounded-2xl bg-surface border border-border/50 flex items-center p-8">
                  <div className="w-full">
                    <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Total Splurged</div>
                    <div className="text-5xl font-heading font-bold">₹12,450</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="h-32 rounded-2xl bg-surface border border-border/50 p-6 flex flex-col justify-center">
                     <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Current Streak</div>
                     <div className="text-3xl font-heading font-bold text-warning flex items-center gap-2">
                       <Flame className="w-8 h-8 fill-warning stroke-warning" /> 14 Days
                     </div>
                  </div>
                  <div className="h-32 rounded-2xl bg-surface border border-border/50 p-6 flex flex-col justify-center">
                     <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Next Goal</div>
                     <div className="text-xl font-heading font-bold text-primary mb-2">Goa Trip</div>
                     <div className="h-2 bg-background rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-[65%]"></div>
                     </div>
                  </div>
                </div>
              </div>
              <div className="h-full rounded-2xl bg-surface border border-border/50 p-6 flex flex-col">
                <div className="font-heading font-bold mb-6 text-lg">Huddle AI Coach</div>
                <div className="space-y-4 flex-1">
                  <div className="bg-primary text-black rounded-2xl px-4 py-3 text-sm rounded-br-sm ml-auto w-[85%] shadow-md">
                    I just bought another iced latte...
                  </div>
                  <div className="bg-background border border-border rounded-2xl px-4 py-3 text-sm rounded-bl-sm mr-auto w-[90%] text-foreground shadow-sm flex items-center gap-1">
                    That's the 4th one this week. Your Goa trip fund is crying right now. Stop it. <Skull className="w-4 h-4 inline" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 mt-12 py-12 text-center text-muted-foreground bg-surface/50">
        <div className="flex items-center justify-center mb-6">
          <img src="/assets/huddle.png" alt="Huddle Logo" className="h-8 w-auto object-contain opacity-70 grayscale hover:grayscale-0 transition-all duration-300" />
        </div>
        <p className="text-sm">© 2026 Huddle Inc. All rights reserved. Powered by Next.js & Gemini AI.</p>
      </footer>
    </div>
  )
}
