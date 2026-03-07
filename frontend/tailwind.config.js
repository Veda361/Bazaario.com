export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        netflixBlack: "#141414",
        netflixDark: "#1f1f1f",
        netflixRed: "#E50914",
      },
      boxShadow: {
        glow: "0 0 30px rgba(229,9,20,0.35)",
      },
    },
  },
  plugins: [],
};