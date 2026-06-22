// Gates the in-app surfaces. Uses the EDGE-SAFE config only (no DB adapter),
// so the middleware bundle stays Node-free. The `authorized` callback in
// auth.config.ts decides who gets through; unauthenticated hits on these
// routes are redirected to Google sign-in automatically. The marketing site
// and /builder stay fully public so visitors can explore and build first.
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/dashboard/:path*", "/project/:path*", "/settings/:path*"],
};
