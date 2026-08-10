/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: '#FAF7F0',
        ink: '#1F2421',
        accent: {
          50: '#EEF4FF',
          100: '#D9E6FF',
          400: '#5B7FDB',
          500: '#3D5FC4',
          600: '#2F4AA0',
        },
        surface: {
          dark: '#15181A',
          darkCard: '#1E2225',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        note: '0 1px 2px rgba(31,36,33,0.06), 0 2px 8px rgba(31,36,33,0.05)',
        'note-hover': '0 4px 14px rgba(31,36,33,0.12)',
      },
      borderRadius: {
        note: '14px',
      },
    },
  },
  plugins: [],
};
