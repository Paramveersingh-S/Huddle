'use client';

import { useChat } from '@ai-sdk/react';
import CoachMessageBubble from './CoachMessageBubble';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';
import { Input } from '../ui/input';

export default function CoachChatPanel({ conversationId }: { conversationId?: string }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/coach/chat',
    body: {
      conversationId,
    },
  });

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/10 bg-black/60">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-primary">✨</span> AI Money Coach
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Ask me about your spending, goals, or budgeting!</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-center text-muted-foreground p-8">
            <p>No messages yet. Try asking: "How much did I spend on food this month?"</p>
          </div>
        )}
        {messages.map(m => (
          <CoachMessageBubble key={m.id} message={m} />
        ))}
        {isLoading && (
          <div className="text-primary text-sm animate-pulse ml-4">Coach is typing...</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/60 flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question..."
          className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground rounded-xl"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !input.trim()}
          className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
