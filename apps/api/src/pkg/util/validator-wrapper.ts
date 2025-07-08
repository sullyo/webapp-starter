import { zValidator as zv } from "@hono/zod-validator";
import { logger } from "@repo/logs";
import type { ValidationTargets } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ZodSchema } from "zod";

export const zValidator = <T extends ZodSchema, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T,
) =>
  zv(target, schema, (result, c) => {
    if (!result.success) {
      logger.error({ error: result.error }, "Zod validation error");
      throw new HTTPException(400, { cause: result.error });
    }
  });
