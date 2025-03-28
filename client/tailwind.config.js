/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary-color)",
          hover: "var(--hover-color)",
        },
        secondary: "var(--secondary-color)",
        background: "var(--background-color)",
        surface: "var(--surface-color)",
        card: "var(--card-background)",
        text: {
          DEFAULT: "var(--text-color)",
          muted: "var(--text-muted)",
          "on-primary": "var(--text-on-primary)",
          "on-secondary": "var(--text-on-secondary)",
          "on-dark": "var(--text-on-dark)",
          "on-error": "var(--text-on-error)",
        },
        border: "var(--border-color)",
        success: "var(--success-color)",
        error: "var(--error-color)",
        warning: "var(--warning-color)",
      },
      spacing: {
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
      },
      fontSize: {
        sm: "var(--font-size-sm)",
        base: "var(--font-size-md)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
      },
      fontWeight: {
        normal: "var(--font-weight-normal)",
        medium: "var(--font-weight-medium)",
        bold: "var(--font-weight-bold)",
      },
      boxShadow: {
        DEFAULT: "var(--shadow)",
      },
    },
  },
  plugins: [],
};