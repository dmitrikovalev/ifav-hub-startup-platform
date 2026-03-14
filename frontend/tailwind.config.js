/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0d0f14',
          secondary: '#13151c',
          card: '#1a1d26',
          hover: '#20242f',
          border: '#2a2d3a',
        },
        accent: {
          blue: '#4f8ef7',
          purple: '#8b5cf6',
          green: '#22c55e',
          yellow: '#f59e0b',
          red: '#ef4444',
        },
        text: {
          primary: '#f1f3f9',
          secondary: '#8b92a5',
          muted: '#4b5265',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
