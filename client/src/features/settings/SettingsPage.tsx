import React, { useCallback } from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Switch } from "../../presentational/Switch";
import { setTurnNotificationsSetting } from "./settingsActions";

export const SettingsPage = () => {
  const dispatch = useAppDispatch();
  const turnNotificationsMuted = useAppSelector(
    (state) => state.settings.turnNotificationsMuted
  );
  const toggleTurnNotificationsMute = useCallback(() => {
    dispatch(setTurnNotificationsSetting(!turnNotificationsMuted));
  }, [dispatch, turnNotificationsMuted]);
  return (
    <div className="max-w-[500px] w-full p-2 mx-auto flex gap-2 flex-col items-stretch">
      <h1 className="text-2xl">Settings</h1>
      <div className="bg-primary p-4 rounded-xl flex items-center">
        {/* <span className="flex-auto text-xl">Turn notifications bell</span> */}
        <Switch onChange={toggleTurnNotificationsMute} isSelected={!turnNotificationsMuted}>turn notifications bell enabled</Switch>
      </div>
      <div>Buzzwords version {__APP_VERSION__}</div>
    </div>
  );
};
