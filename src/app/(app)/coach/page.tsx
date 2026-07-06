'use client'

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bot, Hand } from 'lucide-react'

export default function CoachPage() {
  const [messages, setMessages] = useState<{id: string, role: string, content: string}[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const userMsg = { id: Date.now().toString(), role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      })

      if (!res.ok) {
        throw new Error(await res.text() || 'Failed to fetch')
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream available')

      const decoder = new TextDecoder()
      let aiContent = ''
      
      const aiMsgId = (Date.now() + 1).toString()
      setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const textChunk = decoder.decode(value, { stream: true })
        aiContent += textChunk
        
        setMessages(prev => {
          const newMsgs = [...prev]
          newMsgs[newMsgs.length - 1].content = aiContent
          return newMsgs
        })
      }
    } catch (err: any) {
      console.error('Chat error:', err)
      alert('Failed to send message: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])



  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-heading font-bold tracking-tight">AI Coach</h1>
      </div>

      <Card className="flex-1 flex flex-col bg-surface border-border overflow-hidden shadow-2xl shadow-primary/5">
        <CardHeader className="border-b border-border/50 bg-background/80 backdrop-blur">
          <CardTitle className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" />
            <span className="font-heading tracking-tight">Huddle Coach</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 relative bg-gradient-to-b from-surface to-background/50">
          <div className="absolute inset-0 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground opacity-80">
                <div className="mb-6 animate-bounce"><Hand className="w-16 h-16 text-primary/60" /></div>
                <h2 className="text-2xl font-heading font-semibold text-foreground mb-2">Hi! I'm your AI money coach.</h2>
                <p className="max-w-xs">Ask me about your spending, goals, or request a financial roast based on your vibe!</p>
              </div>
            )}
            
            {messages.map(m => (
              <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <Avatar className="w-10 h-10 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">AI</AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-2xl px-5 py-3 max-w-[80%] shadow-md ${m.role === 'user' ? 'bg-primary text-black rounded-br-sm' : 'bg-background border border-border text-foreground rounded-bl-sm'}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
                {m.role === 'user' && (
                  <Avatar className="w-10 h-10 border-2 border-secondary/20">
                    <AvatarFallback className="bg-secondary/10 text-secondary font-bold">ME</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <Avatar className="w-10 h-10 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold animate-pulse">AI</AvatarFallback>
                </Avatar>
                <div className="rounded-2xl px-5 py-3 bg-background border border-border text-muted-foreground animate-pulse rounded-bl-sm">
                  <div className="flex space-x-1 items-center h-5">
                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 border-t border-border/50 bg-background/80 backdrop-blur">
          <form onSubmit={handleSend} className="flex w-full gap-3">
            <input 
              name="prompt"
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Ask about your budget, or tell me what you just bought..." 
              className="flex-1 bg-surface border border-border text-base h-12 rounded-xl px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input?.trim()} 
              className="font-bold shadow-lg shadow-primary/20 h-12 px-6 rounded-xl bg-primary text-black active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
              Send
            </button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
