/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',

  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Keeps your default 'inter'
        inter: ['Inter', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        opensans: ['"Open Sans"', 'sans-serif'], // Use quotes for names with spaces
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'], // Example using a serif font
        sourcesans: ['"Source Sans Pro"', 'sans-serif'],
        ubuntu: ['Ubuntu', 'sans-serif'],
      },
      colors: {
        'primary': '#FF6F61',      // Peach / Coral (Buttons)
        'primary-dark': '#E56557',  // Darker Coral
        'header-bg': '#4A90E2',      // Soft Blue (Header)
        'background': '#FAFAFA',    // Light Gray (Background)
        'text-dark': '#4A4A4A',     // Dark Gray (Text)
        'text-light': '#FFFFFF',    // White Text (for Header)
        'success': '#81C784',      // Soft Green
        'error': '#E57373',        // Muted Red
        // You might define your blue theme colors here too for utility classes
        // 'primary-blue': '#3b82f6',
        // 'background-blue': '#eff6ff',
        // 'text-blue': '#1e3a8a',
      },
      animation: {
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};