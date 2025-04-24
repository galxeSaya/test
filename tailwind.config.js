/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'chart-green': '#4caf50',
        'chart-red': '#ff5722',
        'chart-blue': '#2196f3',
      },
    },
  },
  plugins: [],
}
