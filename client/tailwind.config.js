/** @type {import('tailwindcss').Config} */
module.exports = {

  darkMode: 'class',
  
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'primary': '#FF6F61',      // Peach / Coral (Buttons)
        'primary-dark': '#E56557',  // Darker Coral
        'header-bg': '#4A90E2',    // Soft Blue (Header)
        'background': '#FAFAFA',   // Light Gray (Background)
        'text-dark': '#4A4A4A',    // Dark Gray (Text)
        'text-light': '#FFFFFF',   // White Text (for Header)
        'success': '#81C784',      // Soft Green
        'error': '#E57373',        // Muted Red
      },
      animation: {
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeInDown: {
          '0%': { opacity: 0, transform: 'translateY(-20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};