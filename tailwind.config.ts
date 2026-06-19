import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAF7", // warm white background
        ink: "#111111", // primary text
        subtle: "#5F5F5F", // secondary text
        card: "#FFFFFF",
        line: "#E7E3DA", // border
        copper: {
          DEFAULT: "#C47A3A", // accent
          dark: "#9A5827",
          soft: "#F6E9DC", // soft accent background
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(17,17,17,0.04), 0 8px 24px -12px rgba(17,17,17,0.10)",
        lift: "0 2px 4px rgba(17,17,17,0.05), 0 16px 40px -16px rgba(17,17,17,0.18)",
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
