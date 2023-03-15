import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getColorSchemeSetting, getLowPowerModeSetting, getPreferredDarkThemeSetting, getTurnNotificationsSetting } from "./settingsActions";
import { getCurrentSystemScheme } from "./settingsSelectors";

export enum ColorScheme {
  Light = "light",
  Dark = "dark",
  System = "system",
}

export type ThemeNames = "light" | "dark" | "oled";

interface SettingsState {
  turnNotificationsMuted: boolean;
  colorScheme: ColorScheme;
  preferredDarkTheme: ThemeNames;
  currentSystemScheme: ColorScheme.Dark | ColorScheme.Light;
  lowPowerMode: boolean;
  offline: boolean;
}

// Define the initial state using that type
const initialState: SettingsState = {
  turnNotificationsMuted: getTurnNotificationsSetting(),
  colorScheme: getColorSchemeSetting(),
  preferredDarkTheme: getPreferredDarkThemeSetting(),
  currentSystemScheme: getCurrentSystemScheme(),
  lowPowerMode: getLowPowerModeSetting(),
  offline: false,
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
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
    },
    setOffline: (state, action: PayloadAction<boolean>) => {
      state.offline = action.payload;
    }
  },
});

// Action creators are generated for each case reducer function
export const {
  setTurnNotificationsMute,
  setColorScheme,
  setPreferredDarkTheme,
  setCurrentSystemScheme,
  setLowPowerMode,
  setOffline,
} = settingsSlice.actions;

export default settingsSlice.reducer;
