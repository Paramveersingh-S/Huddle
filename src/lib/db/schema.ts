import { pgTable, uuid, text, numeric, date, timestamp, boolean, primaryKey } from 'drizzle-orm/pg-core';
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

export const coachMessages = pgTable('coach_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
