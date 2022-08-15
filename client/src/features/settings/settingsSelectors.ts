import * as R from 'ramda';

import { RootState } from "../../app/store";
import { Theme, theme } from "../../app/theme";
import { ColorScheme, ThemeNames } from "./settingsSlice";

export const getTheme = (state: RootState) => {
  let _theme: ThemeNames = "light";
  if (
    state.settings.colorScheme === ColorScheme.Dark ||
    (state.settings.colorScheme === ColorScheme.System &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    _theme = state.settings.preferredDarkTheme;
  }
  return theme[_theme];
};

export const getBodyStyleFromTheme = (theme: Theme) => {
  return R.pipe(
    R.toPairs,
    R.map(([key, val]) => `--${key}: ${val};`),
    R.join('')
  )(theme.colors.html)
}