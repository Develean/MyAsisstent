/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#EFF6FF',
          border: '#BFDBFE'
        },
        surface: {
          bg: '#F3F6FA',
          card: '#FFFFFF',
          border: '#E2E8F0'
        },
        typography: {
          main: '#0F1B33',
          muted: '#4A5670',
          sub: '#8E9BAE'
        },
        accent: {
          amber: '#FFF1CC',
          amberText: '#B45309',
          red: '#EF4444',
          green: '#10B981'
        }
      },
      borderRadius: {
        'card': '20px',
        'sheet': '24px'
      }
    },
  },
  plugins: [],
};

