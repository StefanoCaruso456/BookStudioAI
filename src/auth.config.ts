// ===========================================================================
// Edge-safe Auth.js config (ADR-1, split-config pattern).
//
// This half contains NO database adapter and NO Node-only imports, so it can
// run in the Edge middleware bundle. The full config (src/auth.ts) spreads
// this and adds the Drizzle adapter for the Node runtime (route handler +
// server actions). Keeping them split is the documented NextAuth v5 approach
// for "adapter + middleware".
//
// Google creds use the non-standard env names Client_ID / Client_Secret
// (Auth.js would otherwise auto-detect AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET),
// so we wire them in explicitly. AUTH_SECRET signs the JWT.
// ===========================================================================
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/** Routes that require a signed-in user. Single source of truth for the
 *  middleware gate and the client-side action gate. */
export const PROTECTED_PREFIXES = ["/dashboard", "/project"] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export const authConfig = {
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
    // Expose the user id (JWT `sub`) on the session so server actions and the
    // data layer can scope every query by it.
    session({ session, token }) {
      if (token.sub && session.user) session.user.id = token.sub;
      return session;
    },
  },
} satisfies NextAuthConfig;
