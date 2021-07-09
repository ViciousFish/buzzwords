module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#fae7b2'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
