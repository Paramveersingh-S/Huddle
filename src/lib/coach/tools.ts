import { tool } from 'ai';
import { z } from 'zod';
import { db } from '../db/client';
import { transactions, goals, pods } from '../db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { categorizeSpend } from './classifier';

export const buildCoachTools = (userId: string) => {
  return {
    get_transactions: tool({
      description: 'Get recent transactions for the user, optionally filtered by category or date range.',
      parameters: z.object({
        category: z.string().optional(),
        startDate: z.string().optional().describe('YYYY-MM-DD'),
        endDate: z.string().optional().describe('YYYY-MM-DD'),
      }),
      execute: async ({ category, startDate, endDate }) => {
        let query = db.select().from(transactions).where(eq(transactions.userId, userId));
        // Add basic filters if present
        // In a real app we'd construct dynamic drizzle conditions here
        let results = await query;
        if (category) {
          results = results.filter(t => t.category.toLowerCase() === category.toLowerCase());
        }
        if (startDate) {
          results = results.filter(t => t.occurredAt >= startDate);
        }
        if (endDate) {
          results = results.filter(t => t.occurredAt <= endDate);
        }
        return results.slice(0, 20); // Limit to 20 for context window safety
      },
    }),

    get_goal_progress: tool({
      description: 'Get progress on the user\'s savings goals.',
      parameters: z.object({
        goalId: z.string().optional(),
      }),
      execute: async ({ goalId }) => {
        const query = db.select().from(goals).where(eq(goals.userId, userId));
        const results = await query;
        if (goalId) {
          return results.filter(g => g.id === goalId);
        }
        return results;
      },
    }),

    get_pod_status: tool({
      description: 'Get status of savings pods the user is part of or created.',
      parameters: z.object({
        podId: z.string().optional(),
      }),
      execute: async ({ podId }) => {
        const query = db.select().from(pods).where(eq(pods.createdBy, userId));
        const results = await query;
        if (podId) {
          return results.filter(p => p.id === podId);
        }
        return results;
      },
    }),

    categorize_spend: tool({
      description: 'Categorize a spend transaction using the AI classifier.',
      parameters: z.object({
        merchant: z.string(),
        amount: z.number(),
        description: z.string(),
      }),
      execute: async ({ merchant, amount, description }) => {
        const res = await categorizeSpend({ userId, merchant, amount, description });
        return { category: res.category, confidence: res.confidence };
      },
    }),

    run_savings_projection: tool({
      description: 'Run a simple savings projection to see how much will be saved after a given number of months.',
      parameters: z.object({
        monthlyAmount: z.number(),
        months: z.number(),
      }),
      execute: async ({ monthlyAmount, months }) => {
        const total = monthlyAmount * months;
        return {
          monthlyAmount,
          months,
          projectedTotal: total,
          message: \`If you save ₹\${monthlyAmount} for \${months} months, you will have ₹\${total}.\`
        };
      },
    }),
  };
};
