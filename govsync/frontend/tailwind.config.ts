import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 950: "#081326", 900: "#0B2545", 800: "#122F5C", 700: "#1B4079", 600: "#2A5698" },
        teal: { 600: "#0F9D8C", 500: "#14B8A6", 100: "#E4F7F4" },
        amber: { 600: "#B45309", 500: "#D97706", 100: "#FEF3C7" },
        red: { 600: "#DC2626", 100: "#FEE2E2" },
        green: { 600: "#15803D", 100: "#DCFCE7" },
        sand: { 50: "#F6F7F9", 100: "#EEF1F5" },
      },
      fontFamily: {
        display: ['"IBM Plex Sans"', "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
