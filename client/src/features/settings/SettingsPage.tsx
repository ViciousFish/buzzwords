declare global {
  const __APP_VERSION__: string;
  const __COMMIT_HASH__: string;
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

import {
  faPencilAlt,
  faTimes,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactNode, useCallback, useState } from "react";
import { Item } from "react-stately";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Select } from "../../presentational/Select";
import { Switch } from "../../presentational/Switch";
import { NicknameForm } from "./NicknameForm";
import {
  setColorSchemeSetting,
  setPreferredDarkThemeSetting,
  setTurnNotificationsSetting,
} from "./settingsActions";
import { ColorScheme, ThemeNames } from "./settingsSlice";

const SettingsPageSection = ({ children }: { children: ReactNode }) => (
  <div className="bg-lightbg p-2 rounded-xl flex flex-col items-center gap-2">
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
    (state) => state.settings.turnNotificationsMuted
  );
  const colorScheme = useAppSelector((state) => state.settings.colorScheme);
  const preferredDarkTheme = useAppSelector(
    (state) => state.settings.preferredDarkTheme
  );
  const nickname = useAppSelector((state) => state.user.user.nickname);

  const toggleTurnNotificationsMute = useCallback(() => {
    dispatch(setTurnNotificationsSetting(!turnNotificationsMuted));
  }, [dispatch, turnNotificationsMuted]);
  const switchColorScheme = useCallback(
    (key: string) => {
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
  return (
    <div className="p-4 items-stretch bg-primary rounded-xl border border-darkbrown shadow-lg text-text">
      <button
        aria-label="dismiss login prompt"
        className="float-right hover:opacity-75"
        onClick={onDismiss}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <h3 className="text-xl font-bold">Settings</h3>
      <div className="flex flex-col gap-2 my-2">
        <SettingsPageSection>
          <Switch
            onChange={toggleTurnNotificationsMute}
            isSelected={!turnNotificationsMuted}
          >
            <div className="flex items-start w-full flex-col">
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
          {/* <span>Visuals</span> */}
          <Select
            selectedKey={colorScheme}
            onSelectionChange={switchColorScheme}
            label="Color scheme"
          >
            <Item key="light">Light</Item>
            <Item key="dark">Dark</Item>
            <Item key="system">Follow system preference</Item>
          </Select>
          {colorScheme !== "light" && (
            <Select
              selectedKey={preferredDarkTheme}
              onSelectionChange={switchDarkTheme}
              label="Dark mode theme"
            >
              <Item key="dark">Subtle Dark</Item>
              <Item key="oled">OLED Dark</Item>
            </Select>
          )}
        </SettingsPageSection>
        {nickname && (
          <SettingsPageSection>
            <div className="text-left w-full">Nickname</div>
            {nickState === "pristine" && (
              <button
                type="button"
                onClick={() => setNickState("editing")}
                className="text-left p-2 rounded-md bg-input text-text w-full border-2 border-primary flex"
              >
                <span className="flex-auto">{nickname}</span>
                <span className="text-primary">
                  <FontAwesomeIcon icon={faPencilAlt} />
                </span>
              </button>
            )}
            {nickState === "editing" && (
              <NicknameForm
                afterSubmit={() => setNickState("pristine")}
                onCancel={() => setNickState("pristine")}
              />
            )}
          </SettingsPageSection>
        )}
      </div>
      <div className="text-xs opacity-75">
        Buzzwords version {__APP_VERSION__} ({__COMMIT_HASH__})
      </div>
    </div>
  );
};
