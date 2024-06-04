/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["{./views/,./public/}**/*.{html,js,ejs}"],
  theme: {
    extend: {
      colors: {
        "main": {
          50:  "#E8E8E8",
          100: "#DBDBDB",
          200: "#C4C4C4",
          300: "#ABABAB",
          400: "#949494",
          500: "#7D7D7D",
          600: "#636363",
          700: "#4D4D4D",
          800: "#363636",
          900: "#1C1C1C",
          950: "#111111"
        },
        "lighter-main": {
          50:  "#E8E8E8",
          100: "#DEDEDE",
          200: "#C7C7C7",
          300: "#B0B0B0",
          400: "#999999",
          500: "#858585",
          600: "#6E6E6E",
          700: "#575757",
          800: "#404040",
          900: "#2B2B2B",
          950: "#1F1F1F"
        },
        "accent": {
          50: "#FDF7E7",
          100: "#FBF1D5",
          200: "#F8E2A6",
          300: "#F4D47B",
          400: "#F1C651",
          500: "#EDB925",
          600: "#CB9911",
          700: "#97720C",
          800: "#634B08",
          900: "#342704",
          950: "#181202"
        }
      },
      gridTemplateColumns: {
        "main-list": "40px 1fr 3fr 3fr 1fr 1fr",
        "ost-list": "2fr 4fr 1fr"
      }
    }
  },
  plugins: [],
}

