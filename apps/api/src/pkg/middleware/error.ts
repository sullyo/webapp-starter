import { logger } from "@repo/logs";
import type { Context, MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

export const errorHandler = (err: Error | HTTPException, c: Context) => {
  if (err instanceof HTTPException) {
    logger.error({
      status: err.status,
      message: err.message,
    });
    return c.text(err.message, err.status);
  }
  if (err instanceof z.ZodError) {
    return c.text(err.errors.map((err) => err.message).join(",\n"), 400);
  }
  logger.error({
    message: "Unknown Error",
    error: err,
  });
  return c.text("Something went wrong", 500);
};
