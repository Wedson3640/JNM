import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F97316",
        secondary: "#FDBA74",
        background: "#FFF7ED",
        text: "#374151"
      },
      fontFamily: {
        sans: ["Poppins", "Inter", "Segoe UI", "Arial", "sans-serif"]
      },
      boxShadow: {
        soft: "0 16px 40px rgba(249, 115, 22, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
