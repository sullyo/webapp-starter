import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export function createClient(connectionString: string) {
  const client = postgres(connectionString, { prepare: false });
  const drizzleConfig = {
    schema,
    driver: "pg",
    dbCredentials: {
      connectionString,
    },
  };
  return drizzle(client, drizzleConfig);
}

export const db = createClient(process.env.DATABASE_URL!);
