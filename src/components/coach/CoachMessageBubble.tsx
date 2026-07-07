import { Message } from 'ai';
import { cn } from '@/lib/utils';

export default function CoachMessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
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
        {message.toolInvocations && message.toolInvocations.length > 0 && (
          <div className="text-xs opacity-70 mb-2 italic flex flex-col gap-1">
            {message.toolInvocations.map(invocation => (
              <span key={invocation.toolCallId}>
                {'state' in invocation && invocation.state === 'result' 
                  ? `✓ Checked ${invocation.toolName.replace(/_/g, ' ')}` 
                  : `⏳ Checking ${invocation.toolName.replace(/_/g, ' ')}...`}
              </span>
            ))}
          </div>
        )}
        
        {message.content && (
          <div className="whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
}
