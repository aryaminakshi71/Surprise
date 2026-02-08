import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  recipient: text("recipient").notNull(),
  date: text("date").notNull(),
  location: text("location").notNull(),
  theme: text("theme").notNull(),
  description: text("description"),
  isRevealed: integer("is_revealed", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
})

export const guests = sqliteTable("guests", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  email: text("email"),
  rsvp: text("rsvp", { enum: ["pending", "confirmed", "declined"] })
    .default("pending")
    .notNull(),
  plusOne: integer("plus_one", { mode: "boolean" }).default(false),
  dietaryRestrictions: text("dietary_restrictions"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
})

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false).notNull(),
  dueDate: text("due_date"),
  category: text("category", {
    enum: ["decoration", "food", "entertainment", "other"],
  })
    .default("other")
    .notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
})

export const budgetItems = sqliteTable("budget_items", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  estimated: real("estimated").default(0).notNull(),
  actual: real("actual").default(0).notNull(),
  paid: integer("paid", { mode: "boolean" }).default(false).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
})

export type Event = typeof events.$inferSelect
export type Guest = typeof guests.$inferSelect
export type Task = typeof tasks.$inferSelect
export type BudgetItem = typeof budgetItems.$inferSelect
