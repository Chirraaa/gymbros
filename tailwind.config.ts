import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[class~="dark"]'],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
};

export default config;