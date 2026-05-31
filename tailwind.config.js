/** @type {import('tailwindcss').Config} */
export default {
  content: ['./client/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#0a0a0c',
          900: '#0f0f11',
          800: '#141416',
          700: '#1a1a1f',
          600: '#22222a',
          500: '#2e2e3a',
          400: '#3e3e50',
          300: '#6b6b85',
          200: '#9090aa',
          100: '#c8c8d8',
          50:  '#e8e8f0',
        },
        accent: {
          DEFAULT: '#7c3aed',
          hover:   '#6d28d9',
          light:   '#a78bfa',
          dim:     'rgba(124,58,237,0.15)',
        },
        success: '#4ade80',
        warning: '#fbbf24',
        danger:  '#f87171',
        info:    '#60a5fa',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
