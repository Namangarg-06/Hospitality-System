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
          50: '#F4F7F5',
          100: '#E4ECE7',
          200: '#C5D7CC',
          500: '#2A6354',
          700: '#1D4A3E',
          800: '#173D32', // Primary green
          900: '#102C25', // Deep green
          950: '#091A16',
        },
        champagne: {
          50: '#FAF6ED',
          100: '#F4ECD8',
          200: '#E8D7B0',
          300: '#DCB980',
          400: '#D2B375',
          500: '#C6A66A', // Champagne accent
          600: '#B08E50',
          700: '#8C6F3B',
          800: '#68512A',
        },
        ivory: {
          50: '#FCFBF9',
          100: '#F8F6F0', // Main background
          200: '#EFECE2',
          300: '#E7E4DC', // Border color
        },
        stone: {
          800: '#202722', // Primary text
          500: '#737B73', // Secondary text
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(16, 44, 37, 0.04), 0 1px 2px 0 rgba(16, 44, 37, 0.02)',
        'luxury': '0 10px 25px -5px rgba(23, 61, 50, 0.08), 0 8px 10px -6px rgba(23, 61, 50, 0.04)',
        'gold-glow': '0 0 20px -3px rgba(198, 166, 106, 0.25)',
      }
    },
  },
  plugins: [],
}
