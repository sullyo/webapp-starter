// From: https://github.com/honojs/middleware/blob/main/packages/clerk-auth/src/index.ts

import type { ClerkClient, ClerkOptions } from "@clerk/backend";
import { createClerkClient } from "@clerk/backend";
import type { Context, MiddlewareHandler } from "hono";
import { env } from "hono/adapter";

type ClerkAuth = ReturnType<Awaited<ReturnType<ClerkClient["authenticateRequest"]>>["toAuth"]>;

declare module "hono" {
  interface ContextVariableMap {
    clerk: ClerkClient;
    clerkAuth: ClerkAuth;
  }
}

export const getAuth = (c: Context) => {
  const clerkAuth = c.get("clerkAuth");

  return clerkAuth;
};

export const getUserId = (c: Context) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    throw new Error("Unauthorized");
  }
  return auth.userId;
};

type ClerkEnv = {
  CLERK_SECRET_KEY: string;
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_API_URL: string;
  CLERK_API_VERSION: string;
};

export const auth = (options?: ClerkOptions): MiddlewareHandler => {
  return async (c, next) => {
    const clerkEnv = env<ClerkEnv>(c);
    const { secretKey, publishableKey, apiUrl, apiVersion, ...rest } = options || {
      secretKey: clerkEnv.CLERK_SECRET_KEY || "",
      publishableKey: clerkEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
      apiUrl: clerkEnv.CLERK_API_URL,
      apiVersion: clerkEnv.CLERK_API_VERSION,
    };
    if (!secretKey) {
      throw new Error("Missing Clerk Secret key");
    }

    if (!publishableKey) {
      throw new Error("Missing Clerk Publishable key");
    }

    const clerkClient = createClerkClient({
      ...rest,
      apiUrl,
      apiVersion,
      secretKey,
      publishableKey,
    });

    const requestState = await clerkClient.authenticateRequest(c.req.raw, {
      ...rest,
      secretKey,
      publishableKey,
    });

    if (requestState.headers) {
      requestState.headers.forEach((value, key) => c.res.headers.append(key, value));

      const locationHeader = requestState.headers.get("location");

      if (locationHeader) {
        return c.redirect(locationHeader, 307);
      } else if (requestState.status === "handshake") {
        throw new Error("Clerk: unexpected handshake without redirect");
      }
    }

    c.set("clerkAuth", requestState.toAuth());
    c.set("clerk", clerkClient);

    await next();
  };
};

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.text("Unauthorized", 401);
  }
  await next();
};
