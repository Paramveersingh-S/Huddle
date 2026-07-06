import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db/client'
import { profiles, transactions } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { google } from '@ai-sdk/google'
import { streamText } from 'ai'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { messages } = await req.json()

  // Get user profile and recent transactions for context
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id))
  
  const recentTxs = await db.select().from(transactions).where(eq(transactions.userId, user.id)).orderBy(desc(transactions.occurredAt)).limit(10)

  let vibePrompt = ''
  if (profile?.moneyVibe === 'blunt') {
    vibePrompt = 'Be extremely blunt, direct, and slightly harsh. Do not sugarcoat anything. Roast them if they spend too much.'
  } else if (profile?.moneyVibe === 'nerdy') {
    vibePrompt = 'Be highly analytical, detail-oriented, and use financial terminology. Focus on numbers, percentages, and ROI.'
  } else {
    vibePrompt = 'Be playful, encouraging, and use Gen Z slang occasionally (like "no cap", "slay", "vibes"). Keep it light and fun.'
  }

  const txContext = recentTxs.length > 0 
    ? `Recent transactions: ${recentTxs.map(t => `${t.merchant} (₹${t.amount})`).join(', ')}`
    : 'No recent transactions logged yet.'

  const systemPrompt = `You are Huddle, an AI money coach for a Gen Z user. 
Your personality: ${vibePrompt}
User's context: ${txContext}
Limit your responses to short, conversational messages (1-3 sentences).`

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages,
  })

  return result.toTextStreamResponse()
}
