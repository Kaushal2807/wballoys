/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Cream background for light mode
        cream: {
          DEFAULT: '#fdf8f0',
          50: '#fefcf7',
          100: '#fdf8f0',
          200: '#faf1e0',
        },
        // Primary accent - Warm Amber
        primary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Dark mode colors - Warm Charcoal
        dark: {
          bg: '#1a1714',
          surface: '#2a2520',
          border: '#3d3630',
          text: '#f5f0eb',
          'text-secondary': '#c4b8aa',
        },
      },
    },
  },
  plugins: [],
}
