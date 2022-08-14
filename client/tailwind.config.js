module.exports = {
  mode: "jit",
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        fredoka: ['fredoka_oneregular', 'sans'],
        // sans: ['Patrick\\ Hand', 'sans']
      },
      colors: {
        lightbg1: ({ opacityVariable, opacityValue }) => {
          if (opacityValue !== undefined) {
            return `rgba(250, 231, 178, ${opacityValue})`;
          }
          if (opacityVariable !== undefined) {
            return `rgba(250, 231, 178, var(${opacityVariable}, 1))`;
          }
          return `rgb(250, 231, 178)`;
        },
        lightbg2: '#f2dc9d',
        darkbg1: '#334155',
        darkbg2: '#1e293b',
        lightprimary: '#F6C54B', // theme.primary on lit tiles
        primary: '#334155', // theme.primary on lit tiles
        darkprimary: '#334155',
        darkbrown: '#59430D',
        p1: "#F3ADDF", // theme.p1 on lit tiles
        p2: "#96BB87", // theme.p2 on lit tiles
        darkp1: "",
        darkp2: "",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
