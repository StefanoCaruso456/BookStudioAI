import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAF7", // warm white background
        ink: "#111111", // primary text
        subtle: "#5B5B5B", // secondary text
        card: "#FFFFFF",
        line: "#E7E3DA", // border
        // Modern Editorial — "Book Studio Ink"
        brand: {
          DEFAULT: "#2F4A5A", // deep editorial slate-blue
          dark: "#243B48", // hover / emphasis
          muted: "#6E8796", // muted brand
          soft: "#EEF3F6", // soft highlight background
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.625rem", // 10px
        xl: "0.75rem", // 12px
        "2xl": "1rem", // 16px
      },
      boxShadow: {
        // published-manuscript, not crypto-dashboard
        card: "0 1px 3px rgba(17,17,17,0.05)",
        lift: "0 1px 3px rgba(17,17,17,0.05), 0 12px 28px -14px rgba(17,17,17,0.14)",
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
