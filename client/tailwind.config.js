/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        fredoka: ["fredoka_oneregular", "sans"],
      },
      boxShadow: {
        upward: "0px -1px 5px 0px rgba(0,0,0,0.2)",
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
        primary: "oklch(85% 0.16 82.07)", // theme.primary on lit tiles

        beeYellow: {
          100: "oklch(97.64% 0.0214 82.06694038779712)",
          200: "oklch(95.88% 0.039 82.06694038779712)",
          250: "oklch(94.7% 0.0511 82.06694038779712)",
          300: "oklch(92% 0.07858902880441465 82.06694038779712)",
          400: "oklch(88.52% 0.1136 82.06694038779712)",//here
          500: "oklch(85% 0.1525025971445893 82.07249786810627)",
          600: "oklch(78% 0.16 82.07)", // DEFAULT
          700: "oklch(67.51% 0.13026009694080318 82.06582566004525)",
          800: "oklch(50.59% 0.0873 82.06582566004525)",
          900: "oklch(39.42% 0.0807 82.06582566004525)"
        },
        paleYellow: {
          50: "oklch(94.55% 0.051 90.66)",
          100: "oklch(93% 0.07 90.66)",
          200: "oklch(91% 0.095 90.66)",
          300: "oklch(90% 0.13 90.66)",
        },
        beeBrown: {
          DEFAULT: "oklch(84.56% 0.146 86.45)",
        },

        sunset: [
          "oklch(64.87% 0.17 247.14)",
          "oklch(67.06% 0.15 272.91)",
          "oklch(69.17% 0.16 304.78)",
          "oklch(71.67% 0.19 332.79)",
          "oklch(72.51% 0.20 351.23)",
          "oklch(71.40% 0.19 5.82)",
          "oklch(71.72% 0.18 26.45)",
          "oklch(74.53% 0.17 49.06)",
          "oklch(78.74% 0.17 69.12)",
          "oklch(80.01% 0.17 72.02)",
          "oklch(81.69% 0.16 75.84)",
          "oklch(82.36% 0.16 77.48)",
          "oklch(83.54% 0.16 79.85)",
          "oklch(84.93% 0.15 82.77)",
          "oklch(86.73% 0.15 86.83)",
          "oklch(88.07% 0.15 88.73)",
          "oklch(89.14% 0.14 90.48)",
        ],

        springtime: [
          {
            darker: "oklch(71.22% 0.18 326.42 / var(--tw-bg-opacity))",
            DEFAULT: "oklch(81.22% 0.18 326.42 / var(--tw-bg-opacity))",
            lighter: "oklch(91.22% 0.13 326.42 / var(--tw-bg-opacity))",
          },
          {
            darker: "oklch(49.7% 0.0565 273.85 / var(--tw-bg-opacity))", // here
            DEFAULT: "oklch(78.53% 0.11 273.85 / var(--tw-bg-opacity))",
            lighter: "oklch(91.25% 0.0258 273.85 / var(--tw-bg-opacity))", // here
          },
          {
            darker: "oklch(67.41% 0.14 230.48 / var(--tw-bg-opacity))",
            DEFAULT: "oklch(77.41% 0.14 230.48 / var(--tw-bg-opacity))",
            lighter: "oklch(94.81% 0.0159 230.48 / var(--tw-bg-opacity))", // here
          },
          {
            darker: "oklch(68.42% 0.14 211.83 / var(--tw-bg-opacity))",
            DEFAULT: "oklch(78.42% 0.14 211.83 / var(--tw-bg-opacity))",
            lighter: "oklch(88.42% 0.09 211.83 / var(--tw-bg-opacity))",
          },
          {
            darker: "oklch(69.09% 0.16 166.72 / var(--tw-bg-opacity))",
            DEFAULT: "oklch(79.09% 0.16 166.72 / var(--tw-bg-opacity))",
            lighter: "oklch(90% 0.005 166.72 / var(--tw-bg-opacity))", // here
          },
          {
            darker: "oklch(71.60% 0.17 122.60 / var(--tw-bg-opacity))",
            DEFAULT: "oklch(81.60% 0.17 122.60 / var(--tw-bg-opacity))",
            lighter: "oklch(91.60% 0.12 122.60 / var(--tw-bg-opacity))",
          },
          {
            darker: "oklch(74.64% 0.17 84.90 / var(--tw-bg-opacity))",
            DEFAULT: "oklch(84.64% 0.17 84.90 / var(--tw-bg-opacity))",
            lighter: "oklch(94.64% 0.12 84.90 / var(--tw-bg-opacity))",
          },
          {
            darker: "oklch(76.52% 0.16 87.42 / var(--tw-bg-opacity))",
            DEFAULT: "oklch(86.52% 0.16 87.42 / var(--tw-bg-opacity))",
            lighter: "oklch(96.52% 0.11 87.42 / var(--tw-bg-opacity))",
          },
          {
            darker: "oklch(78.66% 0.15 90.45 / var(--tw-bg-opacity))",
            DEFAULT: "oklch(88.66% 0.15 90.45 / var(--tw-bg-opacity))",
            lighter: "oklch(98.66% 0.10 90.45 / var(--tw-bg-opacity))",
          },
        ],

        darkbrown: "var(--secondaryAccent)",
        p1: "var(--p1)",
        p2: "var(--p2)",
        text: "var(--text)",
        textSubtle: "var(--textSubtle)",
        textInverse: "var(--textInverse)",
        textLink: "var(--textLink)",
        input: "var(--input)",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
