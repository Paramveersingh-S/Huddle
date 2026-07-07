'use client';

import { useState } from 'react';
import { UIMessage } from 'ai';
import CoachMessageBubble from './CoachMessageBubble';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';
import { Input } from '../ui/input';

export default function CoachChatPanel({ conversationId }: { conversationId?: string }) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage: UIMessage = { id: Date.now().toString(), role: 'user', parts: [{ type: 'text', text: input }] };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, messages: newMessages }),
      });

      if (!response.ok) throw new Error(response.statusText);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      const assistantMessage: UIMessage = { id: (Date.now() + 1).toString(), role: 'assistant', parts: [{ type: 'text', text: '' }] };
      setMessages([...newMessages, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const textPart = assistantMessage.parts[0];
          if (textPart.type === 'text') {
            textPart.text += chunk;
          }
          setMessages([...newMessages, { ...assistantMessage }]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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
