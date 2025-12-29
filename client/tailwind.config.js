/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        NunitoItalica: ["NunitoItalica"],
      },
      colors: {
        primary: {
          DEFAULT: "#396273",
          dark: "#2C3B47",
        },
        secondary: {
          DEFAULT: "#F4E9D9",
          light: "#F7F1E6",
        },
      },
      fontFamily: {
        NunitoItalica: ["NunitoItalica"],
      },
    },
  },
  plugins: [],
};
