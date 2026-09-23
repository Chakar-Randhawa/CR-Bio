import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A12", panel: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.09)",
        violet: { DEFAULT: "#7C6CF6", soft: "#9C8FF9", dim: "#4C3FB0" },
        gold: { DEFAULT: "#F0B429", soft: "#F7CD5C" },
        mist: "#A6A6BF", paper: "#F7F7FB",
      },
      fontFamily: { display: ["var(--font-fraunces)", "serif"], sans: ["var(--font-inter)", "sans-serif"], mono: ["var(--font-jbmono)", "monospace"] },
      backgroundImage: { "grain-glow": "radial-gradient(circle at 20% -10%, rgba(124,108,246,0.10), transparent 50%), radial-gradient(circle at 90% 10%, rgba(240,180,41,0.05), transparent 45%)" },
      boxShadow: { glass: "0 8px 32px rgba(0,0,0,0.35)", "glass-inset": "inset 0 1px 0 rgba(255,255,255,0.08)" },
      borderRadius: { xl2: "1.25rem" },
      keyframes: {
        "border-spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
        "fade-up": { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: { "border-spin": "border-spin 6s linear infinite", "fade-up": "fade-up 0.5s ease-out both" },
    },
  },
  plugins: [],
};
export default config;
