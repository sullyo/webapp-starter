/*
 * This middleware is for using Supabase JWT auth
 * Envs not included in this template, but you all you need is the JWT secret from supabase to use this middleware and auth the user.
 * the JWT secret is available in the supabase dashboard
 */

import type { MiddlewareHandler } from "hono";
import { jwt } from "hono/jwt";

export const supabaseAuth = (): MiddlewareHandler => {
  return (c, next) => {
    const jwtMiddleware = jwt({
      secret: process.env.SUPABASE_JWT_SECRET!,
    });

    return jwtMiddleware(c, next);
  };
};

interface JwtPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  email: string;
  phone: string;
  app_metadata: {
    provider: string;
    providers: string[];
  };
  user_metadata: {
    email: string;
    email_verified: boolean;
    phone_verified: boolean;
    sub: string;
  };
  role: string;
  aal: string;
  amr: unknown[];
  session_id: string;
  is_anonymous: boolean;
}

export type { JwtPayload };
