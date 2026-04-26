/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "marg-navy": "#0D1B2A",
        "marg-blue": "#1565C0",
        "marg-red":  "#C62828",
        "marg-amber":"#E65100",
        "marg-green":"#2E7D32",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        }
      },
      animation: { fadeIn: "fadeIn 0.35s ease-in-out" }
    }
  },
  plugins: [],
}
