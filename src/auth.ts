// ===========================================================================
// Auth.js (NextAuth v5) configuration — Google sign-in, JWT sessions.
//
// No database adapter yet: sessions live in a signed JWT cookie, which is all
// we need until projects move off localStorage onto Postgres. When that lands,
// add a Drizzle adapter here and switch `session.strategy` to "database".
//
// Env vars (set in Vercel — Production + Preview):
//   Client_ID      — Google OAuth client ID
//   Client_Secret  — Google OAuth client secret
//   AUTH_SECRET    — used to sign the session JWT (npx auth secret)
//
// NOTE: the Google credentials use the non-standard names Client_ID /
// Client_Secret (Auth.js would otherwise auto-detect AUTH_GOOGLE_ID /
// AUTH_GOOGLE_SECRET), so we wire them in explicitly below.
// ===========================================================================
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/** Routes that require a signed-in user. Kept here so middleware and the
 *  client gate stay in sync. */
export const PROTECTED_PREFIXES = ["/dashboard", "/project"] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.Client_ID,
      clientSecret: process.env.Client_Secret,
    }),
  ],
  session: { strategy: "jwt" },
  // Trust the deployment host (Vercel sets dynamic hostnames); avoids
  // UntrustedHost errors when the request host isn't statically known.
  trustHost: true,
  callbacks: {
    // Drives middleware redirects: returning false on a protected route sends
    // the visitor to the sign-in flow; everything else stays public.
    authorized({ request, auth }) {
      if (isProtectedPath(request.nextUrl.pathname)) return !!auth;
      return true;
    },
  },
});
