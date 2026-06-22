// ===========================================================================
// Full Auth.js config (Node runtime) — edge-safe config + Drizzle adapter.
//
// The adapter persists users / accounts to Postgres (durable identity), while
// session.strategy stays "jwt" (fast, no per-request DB hit — ADR-1). This
// module imports the DB client (Node-only `postgres`), so it must NOT be
// imported by the Edge middleware — middleware uses src/auth.config.ts.
// ===========================================================================
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db/client";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
});

export { PROTECTED_PREFIXES, isProtectedPath } from "@/auth.config";
