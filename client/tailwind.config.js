/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          500: '#1f8fd6',
          600: '#1674b1',
          700: '#145d8f',
          900: '#12364f'
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
        soft: '0 18px 45px rgba(23, 32, 46, 0.08)'
      }
    }
  },
  plugins: []
};
