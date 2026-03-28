/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
        bihari: ['Plus Jakarta Sans', 'sans-serif'], // Kept for legacy compatibility
      },
      colors: {
        darkbg: '#0c0f10',
        darkcard: '#2c2f30',
        darkborder: '#595c5d',
        citrus: {
          50: '#fff1df',
          100: '#ffefec',
          200: '#f66700',
          300: '#ff7a2f',
          400: '#f95630',
          500: '#fe6b00', // inverse_primary
          600: '#ff7a2f', // primary_container
          700: '#9c3f00', // primary signature
          800: '#893600',
          900: '#4f1c00'
        },
        slate: {
          50: '#f5f6f7', // background/surface
          100: '#eff1f2', // surface_container_low
          200: '#e0e3e4', // surface_container_high
          300: '#dadddf', // surface_variant
          400: '#abadae', // outline_variant
          500: '#757778', // outline
          600: '#595c5d', // on_surface_variant
          700: '#3e4040',
          800: '#2c2f30', // on_surface
          900: '#0c0f10'  // inverse_surface
        }
      }
    },
  },
  plugins: [],
}
