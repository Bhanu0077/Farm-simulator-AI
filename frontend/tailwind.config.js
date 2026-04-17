/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        soil: {
          50: "#f6efe7",
          100: "#ebdbc9",
          200: "#d9bc97",
          300: "#c59a65",
          400: "#b47f43",
          500: "#9b6733",
          600: "#7d5229",
          700: "#5f3d20",
          800: "#422916",
          900: "#28180d"
        },
        leaf: {
          50: "#f3fbf2",
          100: "#def4dd",
          200: "#bee7bc",
          300: "#95d694",
          400: "#69c26a",
          500: "#47a84b",
          600: "#37863b",
          700: "#2d6a31",
          800: "#26552b",
          900: "#214626"
        }
      },
      boxShadow: {
        glow: "0 24px 60px rgba(15, 23, 42, 0.18)",
      },
      backgroundImage: {
        field:
          "radial-gradient(circle at top left, rgba(116, 196, 118, 0.35), transparent 35%), radial-gradient(circle at top right, rgba(180, 127, 67, 0.18), transparent 30%), linear-gradient(135deg, rgba(19, 78, 74, 0.92), rgba(39, 84, 31, 0.88) 45%, rgba(76, 29, 19, 0.8))",
      },
      fontFamily: {
        sans: ["'Segoe UI'", "Tahoma", "Geneva", "Verdana", "sans-serif"],
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        rise: "rise 0.6s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
