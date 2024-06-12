/** @type {import('tailwindcss').Config} */
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
        beeYellow: {
          100: "oklch(97.64% 0.0214 82.06694038779712)",
          200: "oklch(95.88% 0.039 82.06694038779712)",
          250: "oklch(94.7% 0.0511 82.06694038779712)",
          300: "oklch(92% 0.07858902880441465 82.06694038779712)",
          400: "oklch(89% 0.09 82.06694038779712)",//here
          500: "oklch(85% 0.1525025971445893 82.07249786810627)",
          600: "oklch(78% 0.16 82.07)", // DEFAULT
          700: "oklch(67.51% 0.13026009694080318 82.06582566004525)",
          800: "oklch(50.59% 0.0873 82.06582566004525)",
          900: "oklch(39.42% 0.0807 82.06582566004525)",
          950: "oklch(33.23% 0.0549 82.06582566004525)"
        },
        // lighterbg: "oklch(var(--lighterbg))",
        // lightbg: 'rgb(var(--lightbg) / <alpha-value>)',
        // darkbg: "oklch(var(--darkbg))",
        // primary: "var(--primaryAccent)", // theme.primary on lit tiles
        // darkbrown: "var(--secondaryAccent)",
        // p1: "var(--p1)",
        p1: {
          DEFAULT: "#F3ADDF",
          dark: "#984B86"
        },
        // p1
        // p2: "var(--p2)",
        p2: {
          DEFAULT: "#96BB87",
          dark: "#668354"
        },
        // text: "var(--text)",
        // textSubtle: "var(--textSubtle",
        // textInverse: "var(--textInverse)",
        // textLink: "var(--textLink)",
        // input: "var(--input)"
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
