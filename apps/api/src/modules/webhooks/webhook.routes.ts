/* From https://clerk.com/docs/webhooks/sync-data */

import type { WebhookEvent } from "@clerk/backend";
import { db, users } from "@repo/db";
import { logger } from "@repo/logs";
import { Hono } from "hono";
import { Webhook } from "svix";

const webhookRoutes = new Hono().post("/", async (c) => {
  const SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error("Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local");
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);
  // Get headers
  const svix_id = c.req.header("svix-id");
  const svix_timestamp = c.req.header("svix-timestamp");
  const svix_signature = c.req.header("svix-signature");

  // If there are no headers, error out
  if (!(svix_id && svix_timestamp && svix_signature)) {
    return c.text("Error: Missing Svix headers", 400);
  }

  // Get body
  const payload = await c.req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    logger.error("Error: Could not verify webhook:", err);
    return c.text("Error: Verification error", 400);
  }

  // Handle user events
  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, email_addresses } = evt.data;
    const primaryEmailAddress = email_addresses?.[0]?.email_address;
    if (!primaryEmailAddress) {
      return c.text("No email address found", 400);
    }

    try {
      await db
        .insert(users)
        .values({
          userId: id,
          email: primaryEmailAddress,
        })
        .onConflictDoUpdate({
          target: users.userId,
          set: {
            email: primaryEmailAddress,
          },
        });
    } catch (error) {
      logger.error("Error upserting user:", error);
      return c.text("Error: Database operation failed", 500);
    }
  }

  return c.json({ message: "webhook received" }, 200);
});

export { webhookRoutes };
