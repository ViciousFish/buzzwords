import * as R from "ramda";

import { RootState } from "../../app/store";
import { Theme, theme } from "../../app/theme";
import { ColorScheme, ThemeNames } from "./settingsSlice";

export const getCurrentSystemScheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? ColorScheme.Dark
    : ColorScheme.Light;

export const getTheme = ({
  settings: { colorScheme, preferredDarkTheme, currentSystemScheme },
}: RootState) => {
  let _theme: ThemeNames = "light";
  if (
    colorScheme === ColorScheme.Dark ||
    (colorScheme === ColorScheme.System &&
      currentSystemScheme === ColorScheme.Dark)
  ) {
    _theme = preferredDarkTheme;
  }
  return theme[_theme];
};

export const getBodyStyleFromTheme = (theme: Theme) => {
  console.log("🚀 ~ file: settingsSelectors.ts:27 ~ getBodyStyleFromTheme ~ theme:", theme)
  return R.pipe(
    R.toPairs,
    R.map(([key, val]) => `--${key}: ${val};`),
    R.join("")
  )(theme.colors.html);
};
