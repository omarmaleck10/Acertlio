import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0A0E1A",
        paper: "#FAFAF7",
        rule: "#E7E5E0",
        muted: "#6B7280",
        navy: {
          DEFAULT: "#0B1F4F",
          600: "#1E3A8A",
          50: "#EEF2F9",
        },
        saffron: "#C5894A",
        ok: "#16A34A",
        bad: "#DC2626",
      },
      fontFamily: {
        sans: ['"Poppins"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.03em",
      },
      borderRadius: {
        DEFAULT: "8px",
      },
      maxWidth: {
        site: "1200px",
        prose: "65ch",
      },
    },
  },
  plugins: [],
};

export default config;
