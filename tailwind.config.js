/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        prime: {
          wine: "#26070D",
          wine2: "#3B0D17",
          silver: "#F3F0ED",
          charcoal: "#171416",
          muted: "#B8AEB0",
        },
      },
      fontFamily: { sans: ["Plus Jakarta Sans", "sans-serif"] },
    },
  },
  plugins: [],
};
