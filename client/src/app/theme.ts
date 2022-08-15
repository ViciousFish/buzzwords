import { ThemeNames } from "../features/settings/settingsSlice";

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
      textInverse: string;
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
      lightbg: "51, 65, 85",
      darkbg: "#475569",
      p1: "#660F4D",
      p2: "#344B2A",
      text: "white",
      textInverse: "black",
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
        textInverse: "white",
      },
    },
  },
  dark,
  oled: dark,
};
