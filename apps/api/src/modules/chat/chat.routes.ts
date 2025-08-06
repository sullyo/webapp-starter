import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { newId } from "@repo/id";
import { logger } from "@repo/logs";
import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { Hono } from "hono";
import { stream } from "hono/streaming";
import { weatherTool } from "@/modules/chat/tools/weather.tool";
import { auth, getUserId, requireAuth } from "@/pkg/middleware/clerk-auth";

export const chatRoutes = new Hono().use("*", auth(), requireAuth).post("/", async (c) => {
  const { messages, chatId } = (await c.req.json()) as {
    messages: UIMessage[];
    chatId: string;
  };

  const userId = getUserId(c);
  const claude = anthropic("claude-4-sonnet-20250514");
  const googleModel = google("gemini-2.5-flash");

  const modelMessages = convertToModelMessages(messages);

  const originalStream = createUIMessageStream({
    execute: ({ writer }) => {
      const result = streamText({
        headers: {
          "anthropic-beta": "interleaved-thinking-2025-05-14",
        },
        providerOptions: {
          google: {
            thinking: { type: "enabled", budgetTokens: 1024 },
          },
          anthropic: {
            thinking: { type: "disabled", budgetTokens: 1024 },
          },
        },
        system: "You are a helpful assistant.",
        tools: {
          weather: weatherTool(),
        },
        model: claude,
        messages: modelMessages,
        stopWhen: stepCountIs(10),
        experimental_transform: smoothStream({
          delayInMs: 20,
        }),
      });

      writer.merge(
        result.toUIMessageStream({ sendReasoning: true, generateMessageId: () => newId("message") })
      );
    },
    onError: (error: any) => {
      logger.error("Issue with chat stream", error);
      return "error";
    },
    onFinish: async (res) => {},
  });

  c.header("X-Vercel-AI-Data-Stream", "v1");
  c.header("Content-Type", "text/plain; charset=utf-8");

  return stream(c, (stream) => {
    return stream.pipe(originalStream.pipeThrough(new JsonToSseTransformStream()));
  });
});
