import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import * as schema from "./schema";

export type Post = InferSelectModel<typeof schema.posts>;
export type NewPost = InferInsertModel<typeof schema.posts>;

export type Chat = InferSelectModel<typeof schema.chats>;
export type NewChat = InferInsertModel<typeof schema.chats>;

export type ChatMessage = InferSelectModel<typeof schema.chatMessages>;
export type NewChatMessage = InferInsertModel<typeof schema.chatMessages>;

export const chatInsertSchema = createInsertSchema(schema.chats).omit({ userId: true });
export const chatSelectSchema = createSelectSchema(schema.chats);

export const chatMessageInsertSchema = createInsertSchema(schema.chatMessages).omit({
  userId: true,
  chatId: true,
});
export const chatMessageSelectSchema = createSelectSchema(schema.chatMessages);

export const postInsertSchema = createInsertSchema(schema.posts).omit({ userId: true });
export const postSelectSchema = createSelectSchema(schema.posts);
