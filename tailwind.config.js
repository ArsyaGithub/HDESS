/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        'gradient-start': '#667eea',
        'gradient-end': '#764ba2',
      },
      spacing: {
        '15': '3.75rem',
        '70': '17.5rem',
        '90': '22.5rem',
        '65': '16.25rem',
      },
      maxWidth: {
        '70': '17.5rem',
        '90': '22.5rem',
      },
      maxHeight: {
        '65': '16.25rem',
      },
      borderWidth: {
        '3': '3px',
      },
      scale: {
        '115': '1.15',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-error': 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
        'gradient-light': 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
