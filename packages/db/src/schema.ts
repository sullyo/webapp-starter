import { newId, newIdWithoutPrefix } from "@repo/id";
import { jsonb, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { lifecycleDates } from "./util/lifecycle-dates";
export const users = pgTable("users", {
  userId: varchar("user_id", { length: 128 }).primaryKey(),
  // Add more clerk fields you want to sync here
  email: text("email").notNull(),
  ...lifecycleDates,
});

export const posts = pgTable("posts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  userId: varchar("user_id", { length: 128 })
    .notNull()
    .references(() => users.userId),
  ...lifecycleDates,
}).enableRLS();

export const chats = pgTable("chats", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => newIdWithoutPrefix(10)),
  userId: varchar("user_id", { length: 128 })
    .notNull()
    .references(() => users.userId),
  name: text("name").notNull().default("Untitled"),
  ...lifecycleDates,
}).enableRLS();

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => newId("message")),
  chatId: varchar("chat_id", { length: 255 })
    .references(() => chats.id, { onDelete: "cascade" })
    .notNull(),
  message: jsonb("message").notNull(),
  ...lifecycleDates,
}).enableRLS();
