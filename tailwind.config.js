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
    },
  },
  plugins: [],
};
