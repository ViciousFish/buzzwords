import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getColorSchemeSetting, getLowPowerModeSetting, getPreferredDarkThemeSetting, getPushNotificationsEnabledSetting, getTurnNotificationsSetting } from "./settingsActions";
import { getCurrentSystemScheme } from "./settingsSelectors";

export enum ColorScheme {
  Light = "light",
  Dark = "dark",
  System = "system",
}

export type ThemeNames = "light" | "dark" | "oled";

interface SettingsState {
  turnNotificationsMuted: boolean;
  pushNotificationsEnabled: boolean;
  colorScheme: ColorScheme;
  preferredDarkTheme: ThemeNames;
  currentSystemScheme: ColorScheme.Dark | ColorScheme.Light;
  lowPowerMode: boolean;
}

// Define the initial state using that type
const initialState: SettingsState = {
  pushNotificationsEnabled: getPushNotificationsEnabledSetting(),
  // turnNotificationsMuted: getTurnNotificationsSetting(),
  turnNotificationsMuted: true,
  colorScheme: getColorSchemeSetting(),
  preferredDarkTheme: getPreferredDarkThemeSetting(),
  currentSystemScheme: getCurrentSystemScheme(),
  lowPowerMode: getLowPowerModeSetting(),
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setPushNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.pushNotificationsEnabled = action.payload;
    },
    setTurnNotificationsMute: (state, action: PayloadAction<boolean>) => {
      state.turnNotificationsMuted = action.payload;
    },
    setColorScheme: (state, action: PayloadAction<ColorScheme>) => {
      state.colorScheme = action.payload;
    },
    setPreferredDarkTheme: (state, action: PayloadAction<ThemeNames>) => {
      state.preferredDarkTheme = action.payload;
    },
    setCurrentSystemScheme: (
      state,
      action: PayloadAction<ColorScheme.Dark | ColorScheme.Light>
    ) => {
      state.currentSystemScheme = action.payload;
    },
    setLowPowerMode: (state, action: PayloadAction<boolean>) => {
      state.lowPowerMode = action.payload;
    }
  },
});

// Action creators are generated for each case reducer function
export const {
  setPushNotificationsEnabled,
  setTurnNotificationsMute,
  setColorScheme,
  setPreferredDarkTheme,
  setCurrentSystemScheme,
  setLowPowerMode,
} = settingsSlice.actions;

export default settingsSlice.reducer;
