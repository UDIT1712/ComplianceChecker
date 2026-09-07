/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1e3a5f',
        accent: '#38bdf8',
        dark: {
          DEFAULT: '#0f172a',
          surface: '#1e293b'
        },
        light: {
          DEFAULT: '#ffffff',
          surface: '#f8fafc'
        }
      },
      keyframes: {
        dotPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(56,189,248,0.55)' },
          '50%': { boxShadow: '0 0 0 6px rgba(56,189,248,0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 1px rgba(56,189,248,0.35), 0 0 24px rgba(56,189,248,0.10)' },
          '50%': { boxShadow: '0 0 0 1px rgba(56,189,248,0.55), 0 0 34px rgba(56,189,248,0.18)' },
        },
      },
      animation: {
        dotPulse: 'dotPulse 1.8s ease-out infinite',
        glowPulse: 'glowPulse 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
