import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dual: {
          black: "#050505",
          purple: "#655dc6",
          mint: "#6cca98",
          gray: "#d9d8d6",
          soft: "#f6f7fb"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 23, 42, 0.08)",
      }
    },
  },
  plugins: [],
};

export default config;
