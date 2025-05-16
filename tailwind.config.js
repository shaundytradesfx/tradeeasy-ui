/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1f2123',
        accent: '#f39237',
        bg: '#131516',
      },
    },
  },
  plugins: [],
} 