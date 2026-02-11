/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'ui-sans-serif', 'system-ui'],
        body: ['Manrope', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0,0,0,0.15)',
        soft: '0 8px 30px rgba(30, 41, 59, 0.14)'
      }
    }
  },
  plugins: []
};
