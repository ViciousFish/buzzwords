// Break the circular import: settingsSelectors imports ColorScheme from
// settingsSlice, which in turn imports getCurrentSystemScheme from
// settingsSelectors before it has finished evaluating.  Mocking settingsSlice
// here prevents the real module from being evaluated at all, so the cycle
// never triggers.
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("./settingsSlice", () => ({
  ColorScheme: {
    Light: "light",
    Dark: "dark",
    System: "system",
  },
}));

// Firebase is pulled in transitively through settingsActions; mock it too.
vi.mock("../../app/firebase", () => ({
  configure_firebase_messaging: vi.fn(),
  get_token: vi.fn(),
}));

import { getTheme, getBodyStyleFromTheme } from "./settingsSelectors";
// Use the mocked ColorScheme values — they're identical strings to the real enum.
const ColorScheme = { Light: "light", Dark: "dark", System: "system" } as const;
type ColorSchemeValue = (typeof ColorScheme)[keyof typeof ColorScheme];

import { Theme } from "../../app/theme";
import { RootState } from "../../app/store";

function makeSettingsState(
  colorScheme: ColorSchemeValue,
  preferredDarkTheme: "dark" | "oled",
  currentSystemScheme: "light" | "dark"
) {
  return {
    settings: { colorScheme, preferredDarkTheme, currentSystemScheme },
  } as unknown as RootState;
}

// ─── getTheme ─────────────────────────────────────────────────────────────

describe("getTheme", () => {
  it("returns a theme object with html colors", () => {
    const state = makeSettingsState("light", "dark", "light");
    const result = getTheme(state);
    expect(result).toBeDefined();
    expect(result.colors.html).toBeDefined();
  });

  it("dark colorScheme returns a different theme than light", () => {
    const dark = getTheme(makeSettingsState("dark", "dark", "light"));
    const light = getTheme(makeSettingsState("light", "dark", "light"));
    expect(dark).not.toEqual(light);
  });

  it("oled preferredDarkTheme differs from standard dark", () => {
    const dark = getTheme(makeSettingsState("dark", "dark", "light"));
    const oled = getTheme(makeSettingsState("dark", "oled", "light"));
    expect(oled).not.toEqual(dark);
  });

  it("System + system Dark uses a dark theme", () => {
    const systemDark = getTheme(makeSettingsState("system", "dark", "dark"));
    const explicitLight = getTheme(makeSettingsState("light", "dark", "light"));
    expect(systemDark).not.toEqual(explicitLight);
  });

  it("System + system Light uses the light theme", () => {
    const systemLight = getTheme(makeSettingsState("system", "dark", "light"));
    const explicitLight = getTheme(makeSettingsState("light", "dark", "light"));
    expect(systemLight).toEqual(explicitLight);
  });
});

// ─── getBodyStyleFromTheme ────────────────────────────────────────────────

describe("getBodyStyleFromTheme", () => {
  const minimalTheme: Theme = {
    colors: {
      threed: {
        primaryAccent: "#000",
        secondaryAccent: "#000",
        p1: "#000",
        p2: "#000",
        selected: "#000",
        crown: "#000",
        beeYellow: "#000",
        beeBrown: "#000",
      },
      html: {
        primaryAccent: "#ff0000",
        secondaryAccent: "#00ff00",
        lightbg: "0,0,0",
        lighterbg: "0%",
        darkbg: "0%",
        p1: "#0000ff",
        p2: "#ffffff",
        text: "black",
        textSubtle: "grey",
        textInverse: "white",
        textLink: "blue",
        input: "black",
        topbar0: "#111",
        topbar1: "#222",
        stoplights0: "#333",
        stoplights1: "#444",
      },
    },
  };

  it("returns a string of CSS variable declarations", () => {
    const result = getBodyStyleFromTheme(minimalTheme);
    expect(typeof result).toBe("string");
    expect(result).toContain("--primaryAccent: #ff0000;");
    expect(result).toContain("--secondaryAccent: #00ff00;");
    expect(result).toContain("--p1: #0000ff;");
  });

  it("includes a CSS variable for every html color key", () => {
    const result = getBodyStyleFromTheme(minimalTheme);
    for (const key of Object.keys(minimalTheme.colors.html)) {
      expect(result).toContain(`--${key}:`);
    }
  });

  it("does not expose threed colors (only html colors are emitted)", () => {
    // threed.primaryAccent is #000 but html.primaryAccent is #ff0000
    const result = getBodyStyleFromTheme(minimalTheme);
    expect(result).toContain("--primaryAccent: #ff0000;");
    expect(result).not.toContain("--primaryAccent: #000;");
  });
});
