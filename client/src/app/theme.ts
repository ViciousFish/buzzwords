import { mergeDeepRight } from "ramda";
import { ThemeNames } from "../features/settings/settingsSlice";
//
//
//
// CQ: wire up text-textlink to replace text-blue-whatever
//
//
//

// export interface Theme {
//   colors: {
//     threed: {
//       primaryAccent: string;
//       secondaryAccent: string;
//       p1: string;
//       p2: string;
//       selected: string;
//       crown: string;
//       beeYellow: string;
//       beeBrown: string;
//     };
//     html: {
//       primaryAccent: string; // sampled from threed.primaryAccent
//       secondaryAccent: string;
//       lightbg: string;
//       /** OKLCH */
//       lighterbg: string;
//       darkbg: string;
//       p1: string; // sampled from threed.p1
//       p2: string; // sampled from threed.p2
//       text: string;
//       textSubtle: string;
//       textInverse: string;
//       textLink: string;
//       input: string;
//       topbar0: string;
//       topbar1: string;
//       stoplights0: string;
//       stoplights1: string;
//     };
//   };
// }

const light = {
  colors: {
    threed: {
      primaryAccent: "#d79e0f",
      sunset: [
        "#0072d0",
        "#636bd0",
        "#995ec5",
        "#c74fad",
        "#de438d",
        "#dd446a",
        "#db513e",
        "#da6a00",
        "#d98500",
        "#d98c00",
        "#d89500",
        "#d89900",
        "#d89f00",
        "#d7a602",
        "#d7ae1f",
        "#d8b42f",
        "#d8b93d",
      ],
      springtime: [
        { darker: "#be53b6", DEFAULT: "#df72d7", lighter: "#e19eda" },
        { darker: "#6d74bc", DEFAULT: "#8a93dd", lighter: "#a9aec9" },
        { darker: "#0083bf", DEFAULT: "#00a3e1", lighter: "#7eb4d4" },
        { darker: "#008eae", DEFAULT: "#00adcf", lighter: "#7dbaca" },
        { darker: "#009b70", DEFAULT: "#00bb8d", lighter: "#70c5a9" },
        { darker: "#699600", DEFAULT: "#87b61f", lighter: "#a8c67b" },
        { darker: "#b78500", DEFAULT: "#d8a500", lighter: "#ddc076" },
        { darker: "#b88e00", DEFAULT: "#d8ae00", lighter: "#dec884" },
        { darker: "#b89700", DEFAULT: "#d8b72f", lighter: "#e0d095" },
      ],
      secondaryAccent: "#59430D",
      p1: "#d788b8",
      p2: "#709867",
      selected: "#9a9a9a",
      crown: "#fcba03",
      beeYellow: "#d79e0f", // oklch(73.41% 0.149 82.07)
      beeBrown: "#59430D",
    },
    html: {
      primaryAccent: "#F6C54B",
      secondaryAccent: "#59430D",
      lightbg: "250, 231, 178",
      lighterbg: "94.55% 0.051 90.66",
      darkbg: "89.8% 0.084 91.05",
      p1: "#F3ADDF",
      p2: "#96BB87",
      text: "black",
      textSubtle: "lightgrey",
      textInverse: "white",
      textLink: "#0e32e9",
      input: "white",
      topbar0: "rgb(233, 187, 72)",
      topbar1: "rgb(246, 197, 75)",
      stoplights0: "rgba(134, 85, 17, 1)",
      stoplights1: "rgba(173, 110, 22, 1)",
    },
  },
};

type Theme = typeof light;

const dark: Theme = {
  colors: {
    threed: {
      primaryAccent: "#18478C",
      secondaryAccent: "#ACC8F1",
      p1: "#83346D",
      p2: "#49693B",
      selected: "#626262",
      crown: "#fcba03",
      beeYellow: "#d79e0f",
      beeBrown: "#59430D",
    },
    html: {
      primaryAccent: "#375BA8",
      secondaryAccent: "#DBF5FE",
      lightbg: "33,54,85",
      lighterbg: "28.49% 0.061 257.98",
      darkbg: "25% 0.06 257.98",
      p1: "#984B86",
      p2: "#668354",
      text: "white",
      textSubtle: "#333333",
      textInverse: "black",
      textLink: "#0e32e9",
      input: "black",
      topbar0: "#0f172a",
      topbar1: "#1e293b",
      stoplights0: "#0f172a",
      stoplights1: "#1e293b",
    },
  },
};

const oled = mergeDeepRight(dark, {
  colors: {
    html: {
      lightbg: "0, 0, 0",
      // darkbg: "31.73% 0.041 255.83",
    },
  },
} as Partial<Theme>);

export const theme: Record<ThemeNames, Theme> = {
  light,
  dark,
  oled,
};
