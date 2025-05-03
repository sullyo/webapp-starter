import { Hono } from "hono";
import { cors } from "hono/cors";

import { postRoutes } from "@/modules/posts";

import { logger } from "hono/logger";
import { errorHandler } from "@/pkg/middleware/error";
import { webhookRoutes } from "@/modules/webhooks/webhook.routes";
import { chatRoutes } from "@/modules/chat/chat.router";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono();

app.use("*", logger());

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.use("*", prettyJSON());

app.get("/health", (c) => {
  return c.text("OK");
});

app.onError(errorHandler);

const routes = app
  .basePath("/api")
  .route("/webhooks", webhookRoutes)
  .route("/posts", postRoutes)
  .route("/chat", chatRoutes);

export type AppType = typeof routes;

export default {
  port: 3004,
  fetch: app.fetch,
  idleTimeout: 30,
};
