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
        // Clean white background for light mode
        cream: {
          DEFAULT: '#f9fafb',
          50: '#ffffff',
          100: '#f9fafb',
          200: '#f3f4f6',
        },
        // Primary accent - Red (light) / Golden (dark) via CSS variables
        primary: {
          50: 'rgb(var(--color-primary-50) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100) / <alpha-value>)',
          200: 'rgb(var(--color-primary-200) / <alpha-value>)',
          300: 'rgb(var(--color-primary-300) / <alpha-value>)',
          400: 'rgb(var(--color-primary-400) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700) / <alpha-value>)',
          800: 'rgb(var(--color-primary-800) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900) / <alpha-value>)',
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
