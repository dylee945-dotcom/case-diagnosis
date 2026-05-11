/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'Noto Sans KR', 'sans-serif'],
      },
      colors: {
        navy: {
          50: '#f0f4fb',
          100: '#dde6f4',
          200: '#bfcfe8',
          300: '#8fafd4',
          400: '#5a87ba',
          500: '#3567a1',
          600: '#264e85',
          700: '#1c3d6e',
          800: '#122a52',
          900: '#0b1a3b',
          950: '#070f22',
        },
        surface: '#f5f6f8',
        'card-border': '#e2e8f0',
      },
      boxShadow: {
        card: '0 1px 4px 0 rgba(11,26,59,0.07)',
        'card-hover': '0 4px 16px 0 rgba(11,26,59,0.12)',
        modal: '0 8px 40px 0 rgba(11,26,59,0.18)',
      },
    },
  },
  plugins: [],
}
