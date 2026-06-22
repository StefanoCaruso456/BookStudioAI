import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Use the public proxy URL (external connections); fall back to DATABASE_URL.
    url: process.env.DATABASE_URL_PUBLIC ?? process.env.DATABASE_URL ?? "",
  },
} satisfies Config;
