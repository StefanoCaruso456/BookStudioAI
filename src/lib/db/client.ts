// ===========================================================================
// Database client — Drizzle over postgres-js (ADR-2).
//
// Serverless-safe: a single bounded-pool client is memoized on globalThis so
// hot reloads and warm Lambdas reuse it rather than exhausting Postgres
// connections. postgres-js connects lazily, so importing this module is safe
// even before DATABASE_URL is set — a real query is what fails (loudly) if the
// URL is missing, never module load.
//
// `prepare: false` keeps us compatible with a transaction-mode pooler
// (e.g. PgBouncer) if we add one later (see Risks in the Phase 1 spec).
// ===========================================================================
import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  __pgClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.__pgClient ??
  postgres(process.env.DATABASE_URL ?? "", {
    max: 1,
    idle_timeout: 20,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") globalForDb.__pgClient = client;

export const db = drizzle(client, { schema });
