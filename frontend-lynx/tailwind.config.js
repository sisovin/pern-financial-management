/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--text-color)",
        card: "var(--card-background)",
        primary: "var(--primary-color)",
        hover: "var(--hover-color)",
        secondary: "var(--text-secondary)",
        border: "var(--border-color)",
      },
    },
  },
  plugins: [],
};

