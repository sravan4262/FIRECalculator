import {
  pgTable,
  uuid,
  text,
  boolean,
  jsonb,
  numeric,
  integer,
  timestamp,
  varchar,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// plans — saved FireInputs snapshots per user
export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  inputs: jsonb("inputs").notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// tracker_categories — per-user savings categories
export const trackerCategories = pgTable("tracker_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  label: text("label").notNull(),
  color: text("color").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// tracker_entries — monthly planned/actual per category
export const trackerEntries = pgTable(
  "tracker_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    month: varchar("month", { length: 7 }).notNull(), // "YYYY-MM"
    categoryId: text("category_id").notNull(),
    planned: numeric("planned"),
    actual: numeric("actual"),
  },
  (t) => [unique().on(t.userId, t.month, t.categoryId)]
);

// chat_sessions — one session per conversation
export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// chat_messages — messages within a session
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  extractedInputs: jsonb("extracted_inputs"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
export type TrackerCategory = typeof trackerCategories.$inferSelect;
export type NewTrackerCategory = typeof trackerCategories.$inferInsert;
export type TrackerEntry = typeof trackerEntries.$inferSelect;
export type NewTrackerEntry = typeof trackerEntries.$inferInsert;
export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
