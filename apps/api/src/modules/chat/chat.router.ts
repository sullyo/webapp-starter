import { auth, getUserId, requireAuth } from "@/pkg/middleware/clerk-auth";

import { type Message, smoothStream, streamText, tool } from "ai";
import { stream } from "hono/streaming";
import { Hono } from "hono";

import { logger } from "@repo/logs";
import { google } from "@ai-sdk/google";
import { anthropic, AnthropicProviderOptions } from "@ai-sdk/anthropic";

const chatRoutes = new Hono().use("*", auth(), requireAuth).post("/", async (c) => {
  const { messages } = (await c.req.json()) as {
    messages: Message[];
  };
  const userId = getUserId(c);

  const gemini = google("gemini-2.5-pro-exp-03-25");
  const claude = anthropic("claude-3-7-sonnet-20250219");

  const result = streamText({
    system: "You are a helpful assistant that can answer questions and help with tasks.",
    messages: messages,
    maxSteps: 10,
    model: claude,
    providerOptions: {
      anthropic: {
        thinking: { type: "enabled", budgetTokens: 1024 },
      } satisfies AnthropicProviderOptions,
      google: {
        thinkingConfig: {
          thinkingBudget: 1024,
        },
      },
    },
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

  c.header("X-Vercel-AI-Data-Stream", "v1");
  c.header("Content-Type", "text/plain; charset=utf-8");

  return stream(c, (stream) =>
    stream.pipe(
      result.toDataStream({
        sendReasoning: true,
        getErrorMessage(error) {
          return "An error occurred";
        },
      }),
    ),
  );
});

export { chatRoutes };
