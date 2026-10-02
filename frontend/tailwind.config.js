/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Alice', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        prussian: {
          DEFAULT: '#14213D',
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#627D98',
          500: '#486581',
          600: '#334E68',
          700: '#243B53',
          800: '#14213D',
          900: '#0B132B',
        },
        orange: {
          DEFAULT: '#FCA311',
          50: '#FFF9E6',
          100: '#FFF0BF',
          200: '#FFE180',
          300: '#FFD240',
          400: '#FCA311',
          500: '#E08C05',
          600: '#B87100',
          700: '#8F5600',
        },
        alabaster: {
          DEFAULT: '#E5E5E5',
          50: '#FAFAFA',
          100: '#F5F5F7',
          200: '#E5E5E5',
          300: '#D4D4D8',
          400: '#A1A1AA',
        }
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(20, 33, 61, 0.04), 0 1px 2px 0 rgba(20, 33, 61, 0.02)',
        'card': '0 2px 8px -1px rgba(20, 33, 61, 0.06), 0 1px 4px -1px rgba(20, 33, 61, 0.04)',
        'elevated': '0 8px 24px -4px rgba(20, 33, 61, 0.08), 0 4px 12px -2px rgba(20, 33, 61, 0.04)',
        'glow-orange': '0 0 0 3px rgba(252, 163, 17, 0.25)',
      }
    },
  },
  plugins: [],
};
