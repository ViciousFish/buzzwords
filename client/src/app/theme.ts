import { ThemeNames } from "../features/settings/settingsSlice";
//
//
//
// CQ: wire up text-textlink to replace text-blue-whatever
//
//
//

export interface Theme {
  colors: {
    threed: {
      primaryAccent: string;
      secondaryAccent: string;
      p1: string;
      p2: string;
      selected: string;
      crown: string;
    };
    html: {
      primaryAccent: string;
      secondaryAccent: string;
      lightbg: string;
      darkbg: string;
      p1: string;
      p2: string;
      text: string;
      textSubtle: string;
      textInverse: string;
      input: string;
      topbar0: string;
      topbar1: string;
    };
  };
}

const dark = {
  colors: {
    threed: {
      primaryAccent: "#18478C",
      secondaryAccent: "#ACC8F1",
      p1: "#660F4D",
      p2: "#49693B",
      selected: "#626262",
      crown: "#fcba03",
    },
    html: {
      primaryAccent: "#18478C",
      secondaryAccent: "#ACC8F1",
      lightbg: "49, 74, 110",
      darkbg: "#475569",
      p1: "#762961",
      p2: "#668354",
      text: "white",
      textSubtle: "#333333",
      textInverse: "black",
      input: "black",
      topbar0: "#0f172a",
      topbar1: "#1e293b",
    },
  },
};

export const theme: Record<ThemeNames, Theme> = {
  light: {
    colors: {
      threed: {
        primaryAccent: "#d79e0f",
        secondaryAccent: "#59430D",
        p1: "#d788b8",
        p2: "#709867",
        selected: "#9a9a9a",
        crown: "#fcba03",
      },
      html: {
        primaryAccent: "#F6C54B",
        secondaryAccent: "#59430D",
        lightbg: "250, 231, 178",
        darkbg: "#f2dc9d",
        p1: "#F3ADDF",
        p2: "#96BB87",
        text: "black",
        textSubtle: "lightgrey",
        textInverse: "white",
        input: "white",
        topbar0: "rgb(233, 187, 72)",
        topbar1: "rgb(246, 197, 75)",
      },
    },
  },
  dark,
  oled: dark,
};
