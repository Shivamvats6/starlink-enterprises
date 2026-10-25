/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0B2340', deep: '#06172B' },
        gold: { DEFAULT: '#C5933D', light: '#E6C783' },
        cream: '#FAF7F0',
        body: '#40516A',
        muted: '#7B8798',
        line: '#E9E4DA',
        success: '#16834A',
        danger: '#D93645',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'Manrope', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '16px' },
      boxShadow: { card: '0 10px 30px -12px rgba(11,35,64,.15)' },
    },
  },
  plugins: [],
}
