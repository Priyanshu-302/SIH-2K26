/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        ayur: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        alabaster: {
          50: '#ffffff',
          100: '#faf9f5',
          200: '#f4f1ea',
          300: '#e9e4d7',
          400: '#dcd4c2',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e6ede7',
          200: '#cfddcf',
          300: '#acc4ad',
          400: '#82a584',
          500: '#618763',
          600: '#4c6c4e',
          700: '#3d563f',
        },
        goldParchment: {
          50: '#fdfbf7',
          100: '#fdf8ee',
          200: '#faedd0',
          300: '#f5dda8',
          400: '#eebf63',
          500: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'soft-card': '0 4px 20px -2px rgba(22, 101, 52, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'elevated': '0 12px 32px -4px rgba(22, 101, 52, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'glow-mint': '0 0 16px rgba(34, 197, 94, 0.25)',
      },
    },
  },
  plugins: [],
}
