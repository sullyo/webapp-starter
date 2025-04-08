import { auth, getUserId, requireAuth } from "@/pkg/middleware/clerk-auth";

import { type Message, smoothStream, streamText, tool } from "ai";
import { stream } from "hono/streaming";
import { Hono } from "hono";

import { z } from "zod";

import { logger } from "@repo/logs";
import { google } from "@ai-sdk/google";

const chatRoutes = new Hono().use("*", auth(), requireAuth).post("/", async (c) => {
  const { messages } = (await c.req.json()) as {
    messages: Message[];
  };
  const userId = getUserId(c);

  const llm = google("gemini-2.0-flash-001");

  const result = streamText({
    system: "You are a helpful assistant that can answer questions and help with tasks.",
    model: llm,

    messages: messages,
    maxSteps: 10,
    experimental_transform: smoothStream({
      delayInMs: 20,
    }),
    onError: (error) => {
      logger.error(error);
    },
    // tools: {
    //   "web-search": tool({
    //     description: "Searches the web for information",
    //     parameters: z.object({
    //       query: z.string(),
    //     }),
    //     execute: async ({ query }) => {
    //       };
    //     },
    //   }),
    // },
  });

  // Mark the response as a v1 data stream:
  c.header("X-Vercel-AI-Data-Stream", "v1");
  c.header("Content-Type", "text/plain; charset=utf-8");

  return stream(c, (stream) => stream.pipe(result.toDataStream()));
});

export { chatRoutes };
