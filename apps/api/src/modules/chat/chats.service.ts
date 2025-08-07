import { anthropic } from "@ai-sdk/anthropic";
import { and, asc, chatMessages, chats, db, desc, eq, type NewChat } from "@repo/db";
import { newId } from "@repo/id";
import { logger } from "@repo/logs";
import type { UIMessage } from "ai";
import { generateText } from "ai";
import { InternalServerError, NotFoundError } from "@/pkg/errors";

export type CreateChatParams = Omit<NewChat, "createdAt" | "updatedAt" | "userId">;

export type UpdateChatParams = Partial<Omit<NewChat, "id" | "createdAt" | "updatedAt" | "userId">>;

export type CreateChatMessageParams = {
  chatId: string;
  messages: UIMessage[];
};

export const chatService = {
  async getChats({ userId }: { userId: string }) {
    const result = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(desc(chats.createdAt));

    return result;
  },

  async getOrCreateChat({
    userId,
    id,
    firstMessage,
  }: {
    userId: string;
    id: string;
    firstMessage?: string;
  }) {
    const [result] = await db
      .select()
      .from(chats)
      .where(and(eq(chats.userId, userId), eq(chats.id, id)))
      .limit(1);

    if (result) {
      return result;
    }

    const newChat = await this.createChat({ userId, id });

    if (firstMessage) {
      this.generateChatTitle({ chatId: id, userId, firstMessage });
    }

    return newChat;
  },

  async generateChatTitle({
    chatId,
    userId,
    firstMessage,
  }: {
    chatId: string;
    userId: string;
    firstMessage: string;
  }) {
    try {
      const { text } = await generateText({
        model: anthropic("claude-4-sonnet-20250514"),
        prompt: `Generate a concise title (max 5 words) for a chat that starts with this message. Only respond with the title, nothing else:\n\n"${firstMessage}"`,
        maxOutputTokens: 20,
      });

      const title = text.trim();
      if (title && title.length > 0) {
        await this.updateChat({ id: chatId, userId, data: { name: title } });
      }
    } catch (error) {
      logger.error({ message: "Failed to generate chat title", error });
    }
  },

  // Get a single chat by ID
  async getChatById({ id, userId }: { id: string; userId: string }) {
    const [result] = await db
      .select()
      .from(chats)
      .where(and(eq(chats.id, id), eq(chats.userId, userId)))
      .limit(1);

    if (!result) {
      throw new NotFoundError("Chat not found");
    }

    return result;
  },

  async createChat({ userId, ...data }: CreateChatParams & { userId: string }) {
    const [result] = await db
      .insert(chats)
      .values({
        ...data,
        id: data.id,
        userId,
      })
      .returning();

    if (!result) {
      throw new InternalServerError("Failed to create chat");
    }

    return result;
  },

  async updateChat({ id, userId, data }: { id: string; userId: string; data: UpdateChatParams }) {
    const [result] = await db
      .update(chats)
      .set({ ...data })
      .where(and(eq(chats.id, id), eq(chats.userId, userId)))
      .returning();

    if (!result) {
      throw new NotFoundError("Chat not found or no permission to update");
    }

    return result;
  },

  async deleteChat({ id, userId }: { id: string; userId: string }) {
    await db.delete(chats).where(and(eq(chats.id, id), eq(chats.userId, userId)));

    return { success: true };
  },

  // Get all messages for a chat
  async getChatMessages({
    chatId,
    userId,
    limit,
  }: {
    chatId: string;
    userId: string;
    limit?: number;
  }) {
    await chatService.getChatById({ id: chatId, userId });

    const result = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatId, chatId))
      .orderBy(asc(chatMessages.createdAt))
      .limit(limit ?? 30);

    const messages = result.map((m) => {
      return {
        id: m.id,
        ...(m.message as any),
      };
    });

    return messages;
  },

  async saveMessages({ chatId, messages, userId }: CreateChatMessageParams & { userId: string }) {
    const baseTimestamp = new Date();
    const updatedMessages = messages.map((message, index) => ({
      ...message,
      id: newId("message"),
      createdAt: new Date(baseTimestamp.getTime() + index * 500),
    }));

    await db.insert(chatMessages).values(
      updatedMessages.map((message) => ({
        chatId,
        message,
      }))
    );

    return { success: true };
  },

  // Get a single chat message by ID
  async getChatMessageById({ id, userId }: { id: string; userId: string }) {
    const [result] = await db
      .select({
        id: chatMessages.id,
        chatId: chatMessages.chatId,
        message: chatMessages.message,
        createdAt: chatMessages.createdAt,
        updatedAt: chatMessages.updatedAt,
      })
      .from(chatMessages)
      .innerJoin(chats, eq(chatMessages.chatId, chats.id))
      .where(and(eq(chatMessages.id, id), eq(chats.userId, userId)))
      .limit(1);

    if (!result) {
      throw new NotFoundError("Chat message not found");
    }

    return result;
  },

  // Update a chat message
  async updateChatMessage({
    id,
    userId,
    message,
  }: {
    id: string;
    userId: string;
    message: UIMessage;
  }) {
    await chatService.getChatMessageById({ id, userId });

    const [result] = await db
      .update(chatMessages)
      .set({ message })
      .where(eq(chatMessages.id, id))
      .returning();

    if (!result) {
      throw new InternalServerError("Failed to update chat message");
    }

    return result;
  },

  // Delete a chat message
  async deleteChatMessage({ id, userId }: { id: string; userId: string }) {
    await chatService.getChatMessageById({ id, userId });

    await db.delete(chatMessages).where(eq(chatMessages.id, id));

    return { success: true };
  },
};
