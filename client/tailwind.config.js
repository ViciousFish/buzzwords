module.exports = {
  mode: "jit",
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        fredoka: ['Fredoka\\ One', 'cursive']
      },
      colors: {
        primary: ({ opacityVariable, opacityValue }) => {
          if (opacityValue !== undefined) {
            return `rgba(250, 231, 178, ${opacityValue})`;
          }
          if (opacityVariable !== undefined) {
            return `rgba(250, 231, 178, var(${opacityVariable}, 1))`;
          }
          return `rgb(250, 231, 178)`;
        },
        darkbrown: '#59430D'
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
