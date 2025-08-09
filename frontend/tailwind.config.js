/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Circular', 'system-ui', 'sans-serif'],
        },
        colors: {
        spotify: {
          green: '#1DB954',
          greenHover: '#1ed760',
          black: '#191414',
          dark: '#121212',
          darkElevated: '#181818',
          card: '#282828',
          text: '#FFFFFF',
          subtext: '#B3B3B3'
        }
        }
      },
    },
    plugins: [],
   }