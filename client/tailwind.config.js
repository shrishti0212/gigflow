/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        bg: "#222831",
        accent: "#00ADB5",
        input: "#393E46",
        text: "#EEEEEE",
      },
    },
  },
  plugins: [],
};
