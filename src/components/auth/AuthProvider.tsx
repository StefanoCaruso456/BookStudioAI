"use client";
// Wraps the app so client components (header, builder gate) can read the
// session via `useSession`. The session itself is a JWT cookie — this just
// hydrates the React context from it.
import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
