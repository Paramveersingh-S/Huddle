export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex h-14 items-center px-4 max-w-7xl mx-auto">
          <div className="font-heading font-bold text-2xl tracking-tight text-primary shadow-primary">HUDDLE</div>
          <div className="ml-auto flex items-center space-x-6 text-sm font-medium">
            <a href="/dashboard" className="text-foreground hover:text-primary transition-colors">Dashboard</a>
            <a href="/goals" className="text-foreground hover:text-primary transition-colors">Goals</a>
            <a href="/pods" className="text-foreground hover:text-secondary transition-colors">Pods</a>
            <a href="/coach" className="text-foreground hover:text-accent transition-colors">Coach</a>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
