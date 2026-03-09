/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mos-green': {
          DEFAULT: '#00873c',
          light: '#00a84d',
          dark: '#006b30',
        },
      },
    },
  },
  plugins: [],
}
