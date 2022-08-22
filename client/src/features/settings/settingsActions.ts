import { AppThunk } from "../../app/store";
import {
  ColorScheme,
  setColorScheme,
  setLowPowerMode,
  setPreferredDarkTheme,
  setTurnNotificationsMute,
  ThemeNames,
} from "./settingsSlice";

export const getTurnNotificationsSetting = () =>
  JSON.parse(
    localStorage.getItem("turnNotificationsMute") || "false"
  ) as boolean;

export const setTurnNotificationsSetting =
  (mute: boolean): AppThunk =>
  (dispatch) => {
    localStorage.setItem("turnNotificationsMute", JSON.stringify(mute));
    dispatch(setTurnNotificationsMute(mute));
  };

function getPrefersReducedMotion() {
  const QUERY = "(prefers-reduced-motion: no-preference)";
  const mediaQueryList = window.matchMedia(QUERY);
  const prefersReducedMotion = !mediaQueryList.matches;
  return prefersReducedMotion;
}

export const getLowPowerModeSetting = () => {
  const setting = localStorage.getItem("lowPowerMode")
  return setting === null ? getPrefersReducedMotion() : JSON.parse(setting); 
}

export const setLowPowerModeSetting =
  (mode: boolean): AppThunk =>
  (dispatch) => {
    localStorage.setItem("lowPowerMode", JSON.stringify(mode));
    dispatch(setLowPowerMode(mode));
  };

export const getColorSchemeSetting = () =>
  (localStorage.getItem("colorScheme") as ColorScheme) || ColorScheme.Light;

export const setColorSchemeSetting =
  (scheme: ColorScheme): AppThunk =>
  (dispatch) => {
    try {
      window.plausible?.("PickScheme", {
        props: { scheme },
      });
    } catch (e) {
      // do nothing
    }
    localStorage.setItem("colorScheme", scheme);
    dispatch(setColorScheme(scheme));
  };

export const getPreferredDarkThemeSetting = () =>
  (localStorage.getItem("preferredDarkTheme") as ThemeNames) || "dark";

export const setPreferredDarkThemeSetting =
  (preferredDarkTheme: ThemeNames): AppThunk =>
  (dispatch) => {
    try {
      window.plausible?.("PickDarkTheme", {
        props: { preferredDarkTheme },
      });
    } catch (e) {
      // do nothing
    }
    localStorage.setItem("preferredDarkTheme", preferredDarkTheme);
    dispatch(setPreferredDarkTheme(preferredDarkTheme));
  };
