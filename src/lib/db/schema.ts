import { pgTable, uuid, text, numeric, date, timestamp, boolean, primaryKey, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// We map to Supabase auth.users indirectly if needed, but profiles is our main table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // references auth.users(id)
  username: text('username').notNull().unique(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  moneyVibe: text('money_vibe'),
  subscriptionTier: text('subscription_tier').notNull().default('free'),
  aiScansUsedThisPeriod: numeric('ai_scans_used_this_period').notNull().default('0'),
  currentStreak: numeric('current_streak').notNull().default('0'),
  longestStreak: numeric('longest_streak').notNull().default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  merchant: text('merchant'),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('INR'),
  category: text('category').notNull(),
  source: text('source').notNull().default('manual'),
  receiptImageUrl: text('receipt_image_url'),
  occurredAt: date('occurred_at').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const goals = pgTable('goals', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  targetAmount: numeric('target_amount', { precision: 10, scale: 2 }).notNull(),
  currentAmount: numeric('current_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  targetDate: date('target_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const pods = pgTable('pods', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  goalTitle: text('goal_title').notNull(),
  targetAmount: numeric('target_amount', { precision: 10, scale: 2 }).notNull(),
  targetDate: date('target_date'),
  isPublic: boolean('is_public').notNull().default(false),
  createdBy: uuid('created_by').notNull().references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const podMembers = pgTable('pod_members', {
  podId: uuid('pod_id').notNull().references(() => pods.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.podId, table.userId] })
  }
});

export const podContributions = pgTable('pod_contributions', {
  id: uuid('id').defaultRandom().primaryKey(),
  podId: uuid('pod_id').notNull().references(() => pods.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const coachConversations = pgTable('coach_conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const coachMessages = pgTable('coach_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull().references(() => coachConversations.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // 'user' | 'assistant' | 'tool' | 'data'
  content: text('content').notNull(),
  toolCalls: jsonb('tool_calls'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// For pgvector, we can use a custom type if drizzle doesn't natively support it in this version,
// or we can use customType. We'll define a simple vector custom type.
import { customType } from 'drizzle-orm/pg-core';

const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(768)';
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`;
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value);
  },
});

export const coachEmbeddings = pgTable('coach_embeddings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  sourceTable: text('source_table').notNull(),
  sourceId: uuid('source_id').notNull(),
  contentText: text('content_text').notNull(),
  embedding: vector('embedding'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const coachClassifierLogs = pgTable('coach_classifier_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  inputText: text('input_text').notNull(),
  predicted: text('predicted').notNull(),
  confidence: numeric('confidence', { precision: 4, scale: 3 }),
  fallbackUsed: boolean('fallback_used').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
