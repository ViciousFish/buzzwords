module.exports = {
  mode: "jit",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        fredoka: ["fredoka_oneregular", "sans"],
        // sans: ['Patrick\\ Hand', 'sans']
      },
      colors: {
        lightbg: ({ opacityVariable, opacityValue }) => {
          if (opacityValue !== undefined) {
            return `rgba(var(--lightbg), ${opacityValue})`;
          }
          if (opacityVariable !== undefined) {
            return `rgba(var(--lightbg), var(${opacityVariable}, 1))`;
          }
          return `rgb(var(--lightbg))`;
        },
        darkbg: "var(--darkbg)",
        primary: "var(--primaryAccent)", // theme.primary on lit tiles
        darkbrown: "var(--secondaryAccent)",
        p1: "var(--p1)",
        p2: "var(--p2)",
        text: "var(--text)",
        textSubtle: "var(--textSubtle",
        textInverse: "var(--textInverse)",
        input: "var(--input)"
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
