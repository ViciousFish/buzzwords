import { RootState } from "../../app/store";
import { theme } from "../../app/theme";
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
