/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cb: {
          navy: '#0B2545',
          'navy-dark': '#07192E',
          'navy-light': '#134074',
          blue: '#0066CC',
          'blue-hover': '#0052A3',
          'blue-subtle': '#EBF5FF',
          slate: '#F8FAFC',
          'slate-border': '#E2E8F0',
          'slate-muted': '#64748B',
          'slate-dark': '#1E293B',
          emerald: '#10B981',
          'emerald-dark': '#059669',
          'emerald-subtle': '#ECFDF5',
          amber: '#F59E0B',
          'amber-subtle': '#FFFBEB',
          rose: '#EF4444',
          'rose-dark': '#DC2626',
          'rose-subtle': '#FEF2F2',
        },
        health: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        emergency: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          900: '#881337',
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 25px -5px rgba(11, 37, 69, 0.08), 0 8px 10px -6px rgba(11, 37, 69, 0.04)',
        'elevated': '0 20px 25px -5px rgba(11, 37, 69, 0.1), 0 8px 10px -6px rgba(11, 37, 69, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
