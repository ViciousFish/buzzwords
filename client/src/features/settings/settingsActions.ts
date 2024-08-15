import { AppThunk } from "../../app/store";
import { configure_firebase_messaging, get_token } from "../../app/firebase";
import {
  ColorScheme,
  setColorScheme,
  setLowPowerMode,
  setPreferredDarkTheme,
  setPushNotificationsEnabled,
  setTurnNotificationsMute,
  ThemeNames,
} from "./settingsSlice";
import { Api } from "../../app/Api";
import { getApiUrl } from "../../app/apiPrefix";
import { addDays } from "date-fns";

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

export const getPushNotificationsEnabledSetting = () =>
  JSON.parse(
    localStorage.getItem("pushNotificationsEnabled") || "false"
  ) as boolean;

export const retrieveAndStorePushToken = async () => {
  try {
    const token = await configure_firebase_messaging();
    if (token === false) {
      return false;
    }
    const res = await Api.post(getApiUrl("/pushToken/register"), {
      token,
    });
    if (res.status === 201) {
      localStorage.setItem("lastPushTokenRefresh", new Date().toISOString());
      return true;
    }
  } catch (e) {
    console.error(e);
  }
  return false;
};

export const refreshTokenIfEnabled = async () => {
  const enabled = getPushNotificationsEnabledSetting();
  if (!enabled) {
    return;
  }
  const lastPushTokenRefresh = localStorage.getItem("lastPushTokenRefresh");
  if (!lastPushTokenRefresh || new Date() > addDays(new Date(lastPushTokenRefresh), 7)) {
    await retrieveAndStorePushToken();
  }
}

export const unregisterPushTokenIfEnabled = async () => {
  const enabled = getPushNotificationsEnabledSetting();
  if (!enabled) {
    return;
  }
  try {
    const token = await get_token();
    await Api.post(getApiUrl("/pushToken/unregister"), {
      token,
    });
  } catch (e) {
    console.error('encountered error unregistering pushToken', e);
  }
}

export const setPushNotificationsEnabledSetting =
  (enabled: boolean): AppThunk =>
  async (dispatch) => {
    if (enabled) {
      const notificationsAllowed = await retrieveAndStorePushToken();
      if (notificationsAllowed) {
        localStorage.setItem(
          "pushNotificationsEnabled",
          JSON.stringify(notificationsAllowed)
        );
        dispatch(setPushNotificationsEnabled(notificationsAllowed));
      }
    } else {
      unregisterPushTokenIfEnabled();
      localStorage.setItem("pushNotificationsEnabled", JSON.stringify(enabled));
      dispatch(setPushNotificationsEnabled(enabled));
    }
  };

function getPrefersReducedMotion() {
  const QUERY = "(prefers-reduced-motion: no-preference)";
  const mediaQueryList = window.matchMedia(QUERY);
  const prefersReducedMotion = !mediaQueryList.matches;
  return prefersReducedMotion;
}

export const getLowPowerModeSetting = () => {
  const setting = localStorage.getItem("lowPowerMode");
  return setting === null ? getPrefersReducedMotion() : JSON.parse(setting);
};

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
