import type { Config } from "tailwindcss";

// ===========================================================================
// Design tokens.
//
// The app (builder, workspace, dashboard) keeps its "Modern Editorial" slate +
// terracotta theme via `brand` / `accent`. The marketing site layers a premium
// "Apple meets Penguin Publishing meets AI" system on top: Midnight + Royal
// Indigo on Warm Ivory, Playfair Display headlines (applied via `font-display`).
// New tokens are ADDITIVE so existing app pages are untouched.
// ===========================================================================
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FAF8F5", // warm ivory background
        ink: "#111827", // primary text
        subtle: "#64748B", // secondary text
        faint: "#94A3B8", // tertiary text
        card: "#FFFFFF",
        line: "#E9E4DC", // warm hairline border
        // --- existing app theme (kept) ---
        brand: {
          DEFAULT: "#223A4A",
          dark: "#182C39",
          muted: "#6E8796",
          soft: "#EEF3F6",
        },
        accent: {
          DEFAULT: "#B97845",
          dark: "#9C6135",
          soft: "#F4EBE1",
        },
        // --- marketing system (new) ---
        midnight: {
          DEFAULT: "#0F172A", // deep midnight (dark sections)
          soft: "#1E293B", // ink navy
          line: "#334155", // border on dark
        },
        indigo: {
          DEFAULT: "#4F46E5", // royal indigo accent
          deep: "#4338CA",
          glow: "#818CF8", // accent glow
          soft: "#EEF0FE", // tint on light
        },
        success: "#0F766E",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      backgroundImage: {
        // Explicit gradient utilities (bg-brand-gradient / -dark). Named so they
        // never collide with the `brand` / `brand-dark` *color* tokens above —
        // otherwise `bg-brand` would emit both a background-color and a
        // background-image, and the gradient would paint over the slate color.
        "brand-gradient":
          "linear-gradient(135deg, #4F46E5 0%, #6366F1 40%, #818CF8 100%)",
        "brand-gradient-dark":
          "linear-gradient(135deg, #312E81 0%, #4338CA 45%, #4F46E5 100%)",
        "midnight-glow":
          "radial-gradient(60% 50% at 50% 0%, rgba(99,102,241,0.22) 0%, rgba(15,23,42,0) 70%)",
      },
      borderRadius: {
        lg: "0.625rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(17,17,17,0.05)",
        lift: "0 2px 4px rgba(15,23,42,0.05), 0 24px 48px -20px rgba(15,23,42,0.25)",
        book: "0 24px 70px -24px rgba(15,23,42,0.55), 0 8px 20px -12px rgba(15,23,42,0.35)",
        soft: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.12)",
        glow: "0 10px 40px -8px rgba(79,70,229,0.45)",
      },
      maxWidth: {
        content: "75rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-16px) rotate(-1deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
