/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          200: '#b7ddff',
          500: '#2f80ed',
          600: '#1d6fe8',
          700: '#1657c8',
          900: '#12364f'
        },
        navy: {
          50: '#eff6ff',
          800: '#08213f',
          900: '#05172d',
          950: '#021024'
        },
        ink: {
          50: '#f7f8fa',
          100: '#eceff3',
          200: '#d8dde8',
          300: '#c3cad6',
          400: '#8a96a8',
          500: '#647083',
          600: '#465263',
          700: '#303948',
          800: '#202938',
          900: '#17202e'
        }
      },
      boxShadow: {
        soft: '0 18px 45px rgba(23, 32, 46, 0.08)',
        card: '0 10px 30px rgba(15, 23, 42, 0.06)',
        nav: '16px 0 40px rgba(2, 16, 36, 0.18)'
      }
    }
  },
  plugins: []
};
