/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom theme colors using CSS variables
        'primary': 'rgb(var(--color-primary) / <alpha-value>)',
        'secondary': 'rgb(var(--color-secondary) / <alpha-value>)',
        'accent': 'rgb(var(--color-accent) / <alpha-value>)',

        // Alternative naming for better semantics
        'theme': {
          'yellow': 'rgb(var(--color-primary) / <alpha-value>)',
          'blue': 'rgb(var(--color-secondary) / <alpha-value>)',
          'white': 'rgb(var(--color-accent) / <alpha-value>)',
        }
      },
    },
  },
  plugins: [],
}