// Augment the Auth.js Session so `session.user.id` is typed everywhere.
// Populated from the JWT `sub` in the session callback (src/auth.config.ts).
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
