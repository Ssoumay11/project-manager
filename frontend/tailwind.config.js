/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#dde6ff",
          500: "#4361ee",
          600: "#3451d1",
          700: "#2840b8",
          900: "#1a2980",
        },
        surface: "#0f1117",
        "surface-2": "#1a1d27",
        "surface-3": "#22263a",
        accent: "#f72585",
        success: "#2ec4b6",
        warning: "#ff9f1c",
        danger: "#e63946",
      },
    },
  },
  plugins: [],
}
