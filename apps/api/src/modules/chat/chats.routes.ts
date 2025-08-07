import { zValidator } from "@hono/zod-validator";
import { chatInsertSchema } from "@repo/db";
import { Hono } from "hono";
import { z } from "zod/v4";
import { auth, getUserId, requireAuth } from "@/pkg/middleware/clerk-auth";
import { chatService } from "./chats.service";

const chatsRoutes = new Hono()
  .use(auth(), requireAuth)
  .get("/", async (c) => {
    const userId = getUserId(c);
    const chats = await chatService.getChats({ userId });
    return c.json(chats, 200);
  })

  // Get a single chat by ID
  .get("/:id", async (c) => {
    const userId = getUserId(c);
    const id = c.req.param("id");
    const chat = await chatService.getChatById({ id, userId });
    return c.json(chat, 200);
  })

  .post("/", zValidator("json", chatInsertSchema), async (c) => {
    const userId = getUserId(c);
    const data = c.req.valid("json");
    const chat = await chatService.createChat({ userId, ...data });
    return c.json(chat, 201);
  })

  .patch("/:id", zValidator("json", chatInsertSchema.partial()), async (c) => {
    const userId = getUserId(c);
    const id = c.req.param("id");
    const data = c.req.valid("json");
    const chat = await chatService.updateChat({ id, userId, data });
    return c.json(chat, 200);
  })

  // Delete a chat
  .delete("/:id", async (c) => {
    const userId = getUserId(c);
    const id = c.req.param("id");
    const result = await chatService.deleteChat({ id, userId });
    return c.json(result, 200);
  })

  .get(
    "/:id/messages",
    zValidator(
      "query",
      z.object({
        limit: z.coerce.number().min(1).max(100).optional(),
      })
    ),
    async (c) => {
      const userId = getUserId(c);
      const chatId = c.req.param("id");
      const { limit } = c.req.valid("query");
      const messages = await chatService.getChatMessages({ chatId, userId, limit });
      return c.json(messages, 200);
    }
  )

  .post(
    "/:id/messages",
    zValidator(
      "json",
      z.object({
        message: z.any(),
      })
    ),
    async (c) => {
      const userId = getUserId(c);
      const chatId = c.req.param("id");
      const { message } = c.req.valid("json");
      const chatMessage = await chatService.saveMessages({ chatId, messages: [message], userId });
      return c.json(chatMessage, 201);
    }
  )

  .get("/:chatId/messages/:messageId", async (c) => {
    const userId = getUserId(c);
    const messageId = c.req.param("messageId");
    const message = await chatService.getChatMessageById({ id: messageId, userId });
    return c.json(message, 200);
  })

  .patch(
    "/:chatId/messages/:messageId",
    zValidator(
      "json",
      z.object({
        message: z.any(),
      })
    ),
    async (c) => {
      const userId = getUserId(c);
      const messageId = c.req.param("messageId");
      const { message } = c.req.valid("json");
      const updatedMessage = await chatService.updateChatMessage({
        id: messageId,
        userId,
        message,
      });
      return c.json(updatedMessage, 200);
    }
  )

  .delete("/:chatId/messages/:messageId", async (c) => {
    const userId = getUserId(c);
    const messageId = c.req.param("messageId");
    const result = await chatService.deleteChatMessage({ id: messageId, userId });
    return c.json(result, 200);
  });

export { chatsRoutes };
