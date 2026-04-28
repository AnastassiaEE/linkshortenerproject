import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const links = pgTable('links', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  originalUrl: text('original_url').notNull(),
  shortCode: text('short_code').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Infer TypeScript types from schema
export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
