import { logger as appLogger } from "@repo/logs";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { chatRoutes } from "@/modules/chat/chat.router";
import { postRoutes } from "@/modules/posts";
import { webhookRoutes } from "@/modules/webhooks/webhook.routes";

const app = new Hono();
app.onError((err, c) => {
  appLogger.error(
    {
      message: err.message,
      cause: err.cause,
      name: err.name,
      stack: err.stack,
      path: c.req.path,
      method: c.req.method,
      url: c.req.url,
    },
    "API Error occurred"
  );

  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  if (err instanceof Error && err.name === "ZodError") {
    return c.json(
      {
        success: false,
        message: "Validation failed",
        errors: (err as any).issues,
      },
      400
    );
  }

  return c.json(
    {
      success: false,
      message: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
      ...(process.env.NODE_ENV === "development" && {
        stack: err.stack,
      }),
    },
    500
  );
});

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

app.use("*", logger());
app.use("*", prettyJSON());

app.get("/health", (c) => {
  return c.text("OK");
});

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
