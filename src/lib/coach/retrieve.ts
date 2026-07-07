import { embed } from 'ai';
import { google } from '@ai-sdk/google';
import { db } from '../db/client';
import { sql } from 'drizzle-orm';
import { coachEmbeddings } from '../db/schema';

export async function retrieveContext(query: string, userId: string, k: number = 8) {
  try {
    // Generate embedding for user query
    const { embedding } = await embed({
      model: google.textEmbeddingModel('text-embedding-004'),
      value: query,
    });

    // We use Drizzle's raw sql for pgvector cosine distance: <=>
    // We strictly filter by user_id at the database level to prevent data leakage.
    // The vector type is stored as a custom type, and we cast the input to vector.
    const results = await db.execute(sql`
      SELECT 
        id, 
        source_table, 
        source_id, 
        content_text,
        1 - (embedding <=> ${JSON.stringify(embedding)}::vector) as similarity
      FROM ${coachEmbeddings}
      WHERE user_id = ${userId}
      ORDER BY embedding <=> ${JSON.stringify(embedding)}::vector
      LIMIT ${k}
    `);

    // Results from raw query. We filter results that have reasonable similarity > 0.3
    const threshold = 0.3;
    const filteredResults = results.filter((row: any) => row.similarity > threshold);

    return filteredResults.map((row: any) => ({
      id: row.id,
      sourceTable: row.source_table,
      sourceId: row.source_id,
      content: row.content_text,
      similarity: row.similarity,
    }));
  } catch (error) {
    console.error('[Coach RAG] Retrieval failed:', error);
    return [];
  }
}
