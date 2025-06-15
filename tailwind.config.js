const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Path ke semua file komponen dan halaman Anda
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 2. Ganti 'inter' menjadi 'sans'
        // Ini akan menimpa font sans-serif default dengan variabel --font-inter (yaitu Inter)
        // dan menyertakan font sistem sebagai cadangan.
        inter: ["var(--font-inter)", ...fontFamily.inter],
      },
      colors: {
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [require("@heroui/react")], // Gunakan require untuk plugin
};
