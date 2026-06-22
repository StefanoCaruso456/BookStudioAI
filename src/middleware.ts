// Gates the in-app surfaces. The `authorized` callback in src/auth.ts decides
// who gets through; unauthenticated hits on these routes are redirected to the
// Google sign-in flow automatically. The marketing site and /builder stay
// fully public so visitors can explore and build before signing in.
export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/project/:path*"],
};
