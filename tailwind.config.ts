import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        foreground: "#ededed",
        cyan: {
          DEFAULT: "#22d3ee",
          300: "#67e8f9",
          400: "#22d3ee",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(34, 211, 238, 0.15)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
