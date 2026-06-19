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
        // Modern Editorial Publishing Platform
        brand: {
          DEFAULT: "#223A4A", // deep editorial slate
          dark: "#182C39", // hover / emphasis
          muted: "#6E8796", // muted brand
          soft: "#EEF3F6", // soft cool highlight
        },
        accent: {
          DEFAULT: "#B97845", // warm editorial terracotta
          dark: "#9C6135",
          soft: "#F4EBE1", // soft warm highlight
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
        card: "0 1px 3px rgba(17,17,17,0.05)",
        lift: "0 1px 3px rgba(17,17,17,0.05), 0 12px 28px -14px rgba(17,17,17,0.14)",
        book: "0 18px 50px -18px rgba(17,17,17,0.45), 0 6px 16px -10px rgba(17,17,17,0.30)",
      },
      maxWidth: {
        content: "72rem",
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "float-slow": "float-slow 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
