declare global {
  const __APP_VERSION__: string;
  // const __COMMIT_HASH__: string;
}

function iOS() {
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

function Android() {
  return /android/i.test(navigator.userAgent);
}

export const IS_MOBILE_BROWSER = iOS() || Android();

import {
  faPencilAlt,
  faTimes,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React, { ReactNode, useCallback, useState } from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  INPUT_BG,
  INPUT_BORDER,
  INPUT_TEXT,
} from "../../presentational/InputColors";
import { Select, Item } from "../../presentational/Select";
import { Switch } from "../../presentational/Switch";
import { NicknameForm } from "./NicknameForm";
import {
  setColorSchemeSetting,
  setLowPowerModeSetting,
  setPreferredDarkThemeSetting,
  setTurnNotificationsSetting,
} from "./settingsActions";
import { ColorScheme, ThemeNames } from "./settingsSlice";

const SettingsPageSection = ({ children }: { children: ReactNode }) => (
  <div
    className={classNames(
      INPUT_TEXT,
      "bg-beeYellow-300 dark:bg-beeYellow-900 p-2 rounded-xl flex flex-col items-stretch gap-2"
    )}
  >
    {children}
  </div>
);

interface SettingsPageProps {
  onDismiss: () => void;
}

export const SettingsPage = ({ onDismiss }: SettingsPageProps) => {
  const [nickState, setNickState] = useState<"pristine" | "editing">(
    "pristine"
  );
  const dispatch = useAppDispatch();

  const turnNotificationsMuted = useAppSelector(
    ({ settings }) => settings.turnNotificationsMuted
  );
  const colorScheme = useAppSelector(({ settings }) => settings.colorScheme);
  const preferredDarkTheme = useAppSelector(
    (state) => state.settings.preferredDarkTheme
  );
  const nickname = useAppSelector(({ user }) => user.user?.nickname);
  const lowPowerMode = useAppSelector(({ settings }) => settings.lowPowerMode);

  const toggleTurnNotificationsMute = useCallback(() => {
    dispatch(setTurnNotificationsSetting(!turnNotificationsMuted));
  }, [dispatch, turnNotificationsMuted]);
  const switchColorScheme = useCallback(
    (key: string) => {
      console.log("key", key);
      dispatch(setColorSchemeSetting(key as ColorScheme));
    },
    [dispatch]
  );
  const switchDarkTheme = useCallback(
    (key: string) => {
      dispatch(setPreferredDarkThemeSetting(key as ThemeNames));
    },
    [dispatch]
  );
  const toggleLowPowerMode = useCallback(
    (mode: boolean) => {
      dispatch(setLowPowerModeSetting(mode));
    },
    [dispatch]
  );

  return (
    <div
      className={classNames(
        "p-4 items-stretch rounded-xl shadow-lg border-2",
        "border-beeYellow-600 dark:border-beeYellow-700 bg-beeYellow-400 dark:bg-beeYellow-800",
        "text-beeYellow-900 dark:text-beeYellow-200"
      )}
    >
      <button
        aria-label="dismiss settings panel"
        className="float-right hover:opacity-75"
        onClick={onDismiss}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <h3 className="text-xl font-bold">Settings</h3>
      <div className="flex flex-col gap-2 my-2">
        {nickname && (
          <SettingsPageSection>
            {nickState === "pristine" && (
              <label className="flex flex-col w-full">
                <div className="text-left w-full pl-2 text-sm m-0">
                  Nickname
                </div>
                <button
                  type="button"
                  onClick={() => setNickState("editing")}
                  className={`${INPUT_BG} ${INPUT_TEXT} ${INPUT_BORDER} text-left p-2 rounded-md w-full flex`}
                >
                  <span className="flex-auto">{nickname}</span>
                  <span className="text-primary">
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </span>
                </button>
              </label>
            )}
            {nickState === "editing" && (
              <NicknameForm
                afterSubmit={() => setNickState("pristine")}
                onCancel={() => setNickState("pristine")}
              />
            )}
          </SettingsPageSection>
        )}
        <SettingsPageSection>
          <Switch onChange={toggleLowPowerMode} isSelected={lowPowerMode}>
            <div className="flex items-start w-full flex-col pl-2">
              <div className="m-0">Low power mode</div>
              <span className="text-xs opacity-75">Disables animations</span>
            </div>
          </Switch>
        </SettingsPageSection>
        <SettingsPageSection>
          <Switch
            onChange={toggleTurnNotificationsMute}
            isSelected={!turnNotificationsMuted}
          >
            <div className="flex items-start w-full flex-col pl-2">
              <div className="m-0">
                <FontAwesomeIcon icon={faVolumeUp} /> Ring bell when it&apos;s
                your turn
              </div>
              {iOS() && (
                <span className="text-xs opacity-75">does not work on iOS</span>
              )}
            </div>
          </Switch>
        </SettingsPageSection>
        <SettingsPageSection>
          <Select
            selectedKey={colorScheme}
            onSelectionChange={switchColorScheme}
            label="Color scheme"
          >
            <Item id="light">Light</Item>
            <Item id="dark">Dark</Item>
            <Item id="system">Follow system preference</Item>
          </Select>
          {colorScheme !== "light" && (
            <Select
              selectedKey={preferredDarkTheme}
              onSelectionChange={switchDarkTheme}
              label="Dark mode theme"
            >
              <Item id="dark">Subtle Dark</Item>
              <Item id="oled">OLED Dark</Item>
            </Select>
          )}
        </SettingsPageSection>
      </div>
      <div className="text-xs opacity-75">
        Buzzwords version {__APP_VERSION__}
      </div>
    </div>
  );
};
