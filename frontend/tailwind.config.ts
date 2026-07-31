import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.15rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "fade-in-down": "fadeInDown 0.5s ease-out forwards",
        "scale-in": "scaleIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        float: "floatY 6s ease-in-out infinite",
        "float-slow": "floatSlow 14s ease-in-out infinite",
        aurora: "auroraDrift 18s ease-in-out infinite",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
        "spin-slow": "spinSlow 14s linear infinite",
        "bounce-micro": "bounceMicro 0.6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        fadeInUp: { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        fadeInDown: { "0%": { opacity: "0", transform: "translateY(-16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        scaleIn: { "0%": { opacity: "0", transform: "scale(0.96)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        floatY: { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-12px)" } },
        floatSlow: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "33%": { transform: "translate3d(8px, -14px, 0)" },
          "66%": { transform: "translate3d(-10px, 6px, 0)" },
        },
        auroraDrift: {
          "0%, 100%": { transform: "translate3d(-6%, -4%, 0) scale(1)" },
          "50%": { transform: "translate3d(6%, 5%, 0) scale(1.12)" },
        },
        pulseGlow: { "0%, 100%": { opacity: "0.55" }, "50%": { opacity: "1" } },
        spinSlow: { to: { transform: "rotate(360deg)" } },
        bounceMicro: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-2px)" } },
      },
    },
  },
  plugins: [],
};

export default config;
