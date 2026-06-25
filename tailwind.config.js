/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // LendSwift brand palette (Spec Day 1)
        brand: {
          DEFAULT: '#1F4E79', // primary blue
          50: '#eaf1f8',
          100: '#cfe0ef',
          600: '#1F4E79',
          700: '#193e60',
          800: '#132f49',
        },
        accent: {
          DEFAULT: '#27AE60', // success green
          600: '#27AE60',
          700: '#1f8c4d',
          800: '#176d3c', // AA-contrast green for small text on white
        },
        danger: {
          DEFAULT: '#E74C3C', // error red
          600: '#E74C3C',
          700: '#c0392b',
        },
        warning: {
          DEFAULT: '#F39C12', // warning amber
          600: '#F39C12',
        },
      },
      minHeight: {
        // WCAG 2.5.5 / spec B4.2: touch targets >= 44x44px
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(31, 78, 121, 0.18)',
        'card-lg': '0 24px 50px -18px rgba(31, 78, 121, 0.28)',
        btn: '0 10px 20px -8px rgba(31, 78, 121, 0.55)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #1F4E79 0%, #2D6CDF 100%)',
        'accent-gradient': 'linear-gradient(135deg, #27AE60 0%, #1f8c4d 100%)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.35s ease-out',
      },
    },
  },
  plugins: [],
};
