import { signOut } from './actions'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex flex-col sm:flex-row h-auto sm:h-16 items-center px-4 max-w-7xl mx-auto py-3 sm:py-0 gap-3 sm:gap-0">
          <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto pb-2 sm:pb-0">
            <img src="/assets/huddle.png" alt="Huddle Logo" className="h-8 sm:h-9 w-auto object-contain drop-shadow-[0_0_10px_rgba(184,255,60,0.2)]" />
          </div>
          <div className="sm:ml-auto flex items-center justify-center space-x-6 sm:space-x-8 text-sm font-medium w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <a href="/dashboard" className="text-foreground hover:text-primary transition-colors whitespace-nowrap font-semibold">Dashboard</a>
            <a href="/goals" className="text-foreground hover:text-primary transition-colors whitespace-nowrap font-semibold">Goals</a>
            <a href="/pods" className="text-foreground hover:text-secondary transition-colors whitespace-nowrap font-semibold">Pods</a>
            <a href="/coach" className="text-foreground hover:text-accent transition-colors whitespace-nowrap font-semibold">Coach</a>
            <form action={signOut} className="flex items-center ml-2">
              <button type="submit" className="text-muted-foreground hover:text-destructive transition-colors whitespace-nowrap font-bold">Sign Out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
