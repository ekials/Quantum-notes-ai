/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7c6af5',
          50: '#f3f1fe',
          100: '#e9e5fd',
          200: '#d4cffa',
          300: '#b7adf7',
          400: '#9483f2',
          500: '#7c6af5',
          600: '#6449e8',
          700: '#5538d4',
          800: '#4630ae',
          900: '#3b2c8d',
        },
        accent: {
          DEFAULT: '#00f5c4',
          50: '#edfff9',
          100: '#d5fff4',
          200: '#aefee9',
          300: '#70fbd7',
          400: '#2bf0be',
          500: '#00f5c4',
          600: '#00c49e',
          700: '#009b7e',
          800: '#067a65',
          900: '#096453',
        },
        dark: {
          DEFAULT: '#0a0a0f',
          50: '#f6f6f7',
          100: '#e1e1e6',
          200: '#c2c2cc',
          300: '#9a9aae',
          400: '#71718e',
          500: '#565673',
          600: '#44445c',
          700: '#2e2e42',
          800: '#1a1a2e',
          900: '#0f0f1a',
          950: '#0a0a0f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(124, 106, 245, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(124, 106, 245, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
