import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { createClient } from '@/utils/supabase/server';
import { COACH_SYSTEM_PROMPT } from '@/lib/coach/system-prompt';
import { buildCoachTools } from '@/lib/coach/tools';
import { db } from '@/lib/db/client';
import { coachMessages, coachConversations } from '@/lib/db/schema';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages, conversationId } = await req.json();

    // In a real implementation, we'd ensure conversationId belongs to the user,
    // or create a new conversation if it doesn't exist.
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const [newConv] = await db.insert(coachConversations).values({
        userId: user.id,
        title: 'New Chat',
      }).returning({ id: coachConversations.id });
      currentConversationId = newConv.id;
    }

    // Save the incoming user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'user') {
      await db.insert(coachMessages).values({
        conversationId: currentConversationId,
        role: 'user',
        content: lastMessage.content,
      });
    }

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: COACH_SYSTEM_PROMPT,
      messages,
      tools: buildCoachTools(user.id),
      onFinish: async ({ text, toolCalls }) => {
        // Save the assistant's final response and any tool calls made
        await db.insert(coachMessages).values({
          conversationId: currentConversationId,
          role: 'assistant',
          content: text || '',
          toolCalls: toolCalls ? JSON.stringify(toolCalls) : null,
        });
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('[Coach API] Chat error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
