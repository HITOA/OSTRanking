/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.{html,js,ejs}"],
  theme: {
    extend: {
      backgroundImage: {
        "main-background": "url(\"/imgs/bg.jpg\")"
      }
    },
  },
  plugins: [],
}

