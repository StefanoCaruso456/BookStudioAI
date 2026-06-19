import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// Vitest config for Book Studio AI.
// - tsconfigPaths resolves the "@/..." alias from tsconfig.json so tests can
//   import app modules the same way the app does.
// - jsdom gives us a DOM (needed for the Zustand localStorage store and any
//   future React Testing Library component tests).
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
