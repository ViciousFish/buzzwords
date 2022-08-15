declare global {
  const __APP_VERSION__: string;
}

function iOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

import { faTimes, faVolumeUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback } from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Switch } from "../../presentational/Switch";
import { setTurnNotificationsSetting } from "./settingsActions";

interface SettingsPageProps {
  onDismiss: () => void;
}

export const SettingsPage = ({ onDismiss }: SettingsPageProps) => {
  const dispatch = useAppDispatch();
  const turnNotificationsMuted = useAppSelector(
    (state) => state.settings.turnNotificationsMuted
  );
  const toggleTurnNotificationsMute = useCallback(() => {
    dispatch(setTurnNotificationsSetting(!turnNotificationsMuted));
  }, [dispatch, turnNotificationsMuted]);
  return (
    <div className="p-4 items-stretch bg-primary rounded-xl border border-darkbrown shadow-lg">
      <button
        aria-label="dismiss login prompt"
        className="float-right hover:opacity-75"
        onClick={onDismiss}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <h3 className="text-xl font-bold">Settings</h3>
      <div className="flex flex-col gap-2 my-2">
        <div className="bg-lightbg p-2 rounded-xl flex items-center">
          <Switch
            onChange={toggleTurnNotificationsMute}
            isSelected={!turnNotificationsMuted}
          >
            <div className="flex flex-col">
              <div className="m-0">
                <FontAwesomeIcon icon={faVolumeUp} /> Ring bell when it&apos;s
                your turn
              </div>
              {iOS() && <span className="text-xs opacity-75">does not work on iOS</span>}
            </div>
          </Switch>
        </div>
      </div>
      <div className="text-xs opacity-75">
        Buzzwords version {__APP_VERSION__}
      </div>
    </div>
  );
};
