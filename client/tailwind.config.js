module.exports = {
  mode: "jit",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        fredoka: ["fredoka_oneregular", "sans"],
      },
      boxShadow: {
        'upward': '0px -1px 5px 0px rgba(0,0,0,0.2)',
      },
      colors: {
        lighterbg: "oklch(var(--lighterbg))",
        lightbg: ({ opacityVariable, opacityValue }) => {
          if (opacityValue !== undefined) {
            return `rgba(var(--lightbg), ${opacityValue})`;
          }
          if (opacityVariable !== undefined) {
            return `rgba(var(--lightbg), var(${opacityVariable}, 1))`;
          }
          return `rgb(var(--lightbg))`;
        },
        darkbg: "oklch(var(--darkbg))",
        primary: "var(--primaryAccent)", // theme.primary on lit tiles
        darkbrown: "var(--secondaryAccent)",
        p1: "var(--p1)",
        p2: "var(--p2)",
        text: "var(--text)",
        textSubtle: "var(--textSubtle",
        textInverse: "var(--textInverse)",
        textLink: "var(--textLink)",
        input: "var(--input)"
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('tailwindcss-react-aria-components'),
    require('tailwindcss-animate')
  ],
};
