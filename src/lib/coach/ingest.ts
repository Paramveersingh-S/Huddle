import { embed } from 'ai';
import { google } from '@ai-sdk/google';
import { db } from '../db/client';
import { coachEmbeddings } from '../db/schema';

export async function ingestTransaction(params: {
  userId: string;
  transactionId: string;
  merchant: string;
  amount: number;
  category: string;
  date: string;
}) {
  const { userId, transactionId, merchant, amount, category, date } = params;
  
  // Normalize text representation
  const contentText = `Transaction on ${date}: spent ${amount} at ${merchant} (Category: ${category})`;

  try {
    // Generate embedding using Google Gemini
    // 768 dimensions for text-embedding-004
    const { embedding } = await embed({
      model: google.textEmbeddingModel('text-embedding-004'),
      value: contentText,
    });

    // Store in Postgres via Drizzle
    await db.insert(coachEmbeddings).values({
      userId,
      sourceTable: 'transactions',
      sourceId: transactionId,
      contentText,
      embedding,
    });

    return true;
  } catch (error) {
    console.error(`[Coach RAG] Failed to ingest transaction ${transactionId}:`, error);
    return false;
  }
}

// Optional utility to backfill existing transactions
export async function backfillTransactions() {
  // Logic to pull from `transactions` table where ID is not in `coach_embeddings`
  // and run ingestTransaction. Usually triggered via an admin API route.
}
