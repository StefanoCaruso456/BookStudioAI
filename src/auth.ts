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
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  profiles,
} from "@/lib/db/schema";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  events: {
    // Guarantee a 1:1 profile the moment a user is created (ADR-2), so the
    // onboarding gate has a row to read. Conflict-safe + swallowed: a profile
    // failure must never block sign-in (the loader backfills as a fallback).
    createUser: async ({ user }) => {
      if (!user.id) return;
      try {
        await db
          .insert(profiles)
          .values({ userId: user.id })
          .onConflictDoNothing();
      } catch (err) {
        console.error("createUser: failed to insert profile", err);
      }
    },
  },
});

export { PROTECTED_PREFIXES, isProtectedPath } from "@/auth.config";
