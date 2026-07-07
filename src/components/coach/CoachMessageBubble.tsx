import { UIMessage } from 'ai';
import { cn } from '@/lib/utils';

export default function CoachMessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user';
  
  const textParts = message.parts?.filter(p => p.type === 'text') || [];
  const textContent = textParts.map(p => (p as any).text).join('');

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div 
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-sm" 
            : "bg-white/10 text-white rounded-tl-sm border border-white/5"
        )}
      >
        {/* If the message has tool invocations, we can show a minimal indicator instead of raw text if needed */}
        {message.parts?.filter(p => p.type === 'tool-invocation').length > 0 && (
          <div className="text-xs opacity-70 mb-2 italic flex flex-col gap-1">
            {message.parts.filter(p => p.type === 'tool-invocation').map(invocation => (
              <span key={(invocation as any).toolCallId}>
                {'state' in invocation && (invocation as any).state === 'result' 
                  ? `✓ Checked ${(invocation as any).toolName.replace(/_/g, ' ')}` 
                  : `⏳ Checking ${(invocation as any).toolName.replace(/_/g, ' ')}...`}
              </span>
            ))}
          </div>
        )}
        
        {textContent && (
          <div className="whitespace-pre-wrap leading-relaxed">
            {textContent}
          </div>
        )}
      </div>
    </div>
  );
}
