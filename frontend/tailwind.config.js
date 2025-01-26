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
            brown: '#3E2723',
            lightBrown: '#4E342E', 
            accent: '#8D6E63',
            hover: '#795548'
          }
        }
      },
    },
    plugins: [],
   }