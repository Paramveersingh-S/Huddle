import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db/client'
import { profiles } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Server-side Quota Check
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id)
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const scansUsed = parseInt(profile.aiScansUsedThisPeriod)
    
    if (profile.subscriptionTier === 'free' && scansUsed >= 15) {
      return NextResponse.json({ error: 'Monthly scan quota exceeded on free tier. Upgrade for unlimited scans.' }, { status: 403 })
    }

    // Process image
    const formData = await req.formData()
    const file = formData.get('receipt') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No receipt image provided' }, { status: 400 })
    }

    // Convert file to base64 for Gemini
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Data = buffer.toString('base64')

    // System instruction (from BUILD_SPEC)
    const prompt = `You are a receipt and payment-screenshot parser for a personal finance app.
Given an image, extract:
- merchant (string, best guess from the image)
- amount (number, the total charged — not subtotal)
- currency (3-letter code, infer from symbols/context, default to INR if unclear)
- category (one of: food, transport, subscriptions, shopping, entertainment, bills, health, education, other)
- occurred_at (date in YYYY-MM-DD format, from the receipt if visible, otherwise null)

Respond ONLY with valid JSON matching this schema, no prose, no markdown code fences:
{"merchant": string, "amount": number, "currency": string, "category": string, "occurred_at": string|null, "confidence": "high"|"medium"|"low"}

If the image is not a receipt or payment confirmation, respond with {"error": "not_a_receipt"}.`

    // We use the 'gemini-1.5-flash' model as it is vision-capable, highly accurate, and very cost-effective.
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      }
    ])

    const responseText = result.response.text()
    
    // Clean up potential markdown formatting if the model disobeys
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsedData = JSON.parse(cleanedText)

    if (parsedData.error) {
       return NextResponse.json(parsedData, { status: 400 })
    }

    // Increment usage quota atomically
    await db.update(profiles)
      .set({ aiScansUsedThisPeriod: sql`${profiles.aiScansUsedThisPeriod} + 1` })
      .where(eq(profiles.id, user.id))

    return NextResponse.json(parsedData)
  } catch (error) {
    console.error('Scan Error:', error)
    return NextResponse.json({ error: 'Failed to process receipt' }, { status: 500 })
  }
}
