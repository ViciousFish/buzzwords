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
          100: "oklch(97.64% 0.0214 82.07)",
          200: "oklch(95.5% 0.045 82.07)",
          // 250: "oklch(94.2% 0.0511 82.07)",
          300: "oklch(93% 0.078 82.07)",
          400: "oklch(89% 0.11 82.07)",
          500: "oklch(85% 0.15 82.07)", // primary accent
          510: "oklch(80% 0.15 82.07)",
          600: "oklch(63% 0.14 82.07)", // primary accent dark
          700: "oklch(49% 0.09 82.07)",
          800: "oklch(41% 0.08 82.07)",
          900: "oklch(36% 0.07 82.07)",
          950: "oklch(30% 0.055 82.07)"
        },
        bYellow: {
          // TODO: 100-500ish
        },
        bBrown: {
          // TODO 510-950ish
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
