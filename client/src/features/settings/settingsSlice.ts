import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as R from "ramda";
import { getTurnNotificationsSetting } from "./settingsActions";

// Define a type for the slice state
interface SettingsState {
  turnNotificationsMuted: boolean;
}

// Define the initial state using that type
const initialState: SettingsState = {
  turnNotificationsMuted: getTurnNotificationsSetting(),
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTurnNotificationsMute: (state, action: PayloadAction<boolean>) => {
      state.turnNotificationsMuted = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setTurnNotificationsMute
} = settingsSlice.actions;

export default settingsSlice.reducer;
