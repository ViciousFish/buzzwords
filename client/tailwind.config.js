module.exports = {
  mode: "jit",
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        fredoka: ['Fredoka\\ One', 'sans'],
        // sans: ['Patrick\\ Hand', 'sans']
      },
      colors: {
        lightbg: ({ opacityVariable, opacityValue }) => {
          if (opacityValue !== undefined) {
            return `rgba(250, 231, 178, ${opacityValue})`;
          }
          if (opacityVariable !== undefined) {
            return `rgba(250, 231, 178, var(${opacityVariable}, 1))`;
          }
          return `rgb(250, 231, 178)`;
        },
        darkbg: '#f2dc9d',
        primary: '#F6C54B', // theme.primary on lit tiles
        darkbrown: '#59430D',
        p1: "#F3ADDF", // theme.p1 on lit tiles
        p2: "#92CBEE" // theme.p2 on lit tiles
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
