/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae2fd',
          300: '#7cc8fc',
          400: '#38abf8',
          500: '#0e90e9',
          600: '#0273ca',
          700: '#035ca4',
          800: '#074f87',
          900: '#0c4270',
        }
      }
    },
  },
  plugins: [],
}
