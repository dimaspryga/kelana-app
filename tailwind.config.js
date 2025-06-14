// tailwind.config.js
import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Path ke semua file komponen dan halaman Anda
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // 1. Tambahkan path ke tema HeroUI
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ... (warna-warna lain Anda)
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          // PASTIKAN BARIS INI ADA
          foreground: "hsl(var(--destructive-foreground))",
        },
        // ... (warna-warna lain Anda)
      },
    },
  },
  darkMode: "class",
  // 2. Tambahkan plugin HeroUI
  plugins: [heroui()],
};
