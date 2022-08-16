import React, { useCallback, useState } from "react";
import {
  faBars,
  faCircle,
  faCog,
  faQuestion,
  faSpinner,
  faSyncAlt,
  faVolumeMute,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { useLocation } from "react-router";
import { Popover } from "react-tiny-popover";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
import NativeAppAd from "../../presentational/NativeAppAd";
import { getHowManyGamesAreMyTurn } from "../gamelist/gamelistSelectors";
import { setShowTutorialCard, toggleIsOpen } from "../gamelist/gamelistSlice";
import TutorialCard from "../gamelist/TutorialCard";
import { logout } from "../user/userActions";
import { isUserLoggedIn } from "../user/userSelectors";
import AuthPrompt from "./AuthPrompt";
import { setTurnNotificationsSetting } from "../settings/settingsActions";
import { SettingsPage } from "../settings/SettingsPage";

const ELECTRON = window.versions;
const PLATFORM = window.versions?.platform?.();

const TopBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const gamelistIsOpen = useAppSelector((state) => state.gamelist.isOpen);
  const turnNotificationsMuted = useAppSelector(
    (state) => state.settings.turnNotificationsMuted
  );
  const showTutorialCard = useAppSelector(
    (state) => state.gamelist.showTutorialCard
  );
  const socketConnected = useAppSelector((state) => state.game.socketConnected);
  const isLoggedIn = useAppSelector(isUserLoggedIn);
  const isRefreshing = useAppSelector((state) => state.gamelist.isRefreshing);
  const gamesLoading = useAppSelector((state) => state.gamelist.gamesLoading);
  const currentGame = useAppSelector((state) => state.game.currentGame);
  const currentTurnCount = useAppSelector((state) =>
    getHowManyGamesAreMyTurn(state, currentGame)
  );

  const [_authPrompt, setAuthPrompt] = useState(
    !location.pathname.match(/play|download|settings/)
  );
  const authPrompt = isLoggedIn === false && _authPrompt;

  const [settingsPanel, setSettingsPanel] = useState(false);

  const [nativeAppAd, setNativeAppAd] = useState(false);
  const showDownloadButton = !window.ipc && !location.pathname.match(/download/)

  const isLoading =
    isRefreshing || (currentGame && gamesLoading[currentGame] === "loading");

  const toggleTurnNotificationsMute = useCallback(() => {
    dispatch(setTurnNotificationsSetting(!turnNotificationsMuted));
  }, [dispatch, turnNotificationsMuted]);

  let hamburgerNotification;
  if (!gamelistIsOpen && currentTurnCount) {
    hamburgerNotification = (
      <FontAwesomeIcon
        className={classNames("text-blue-500", "drop-shadow")}
        icon={faCircle}
      />
    );
  }
  return (
    <div
      className={classNames(
        "fixed top-0 z-30 text-darkbrown",
        "h-[calc(50px+var(--sat))] w-screen shadow-md p-t-safe"
      )}
    >
      <div
        className={classNames(
          "flex h-full p-0 items-center topbar",
          !ELECTRON && "rounded-t-xl"
        )}
      >
        <div className="flex h-full gap-1 items-center">
          {PLATFORM === "darwin" && (
            <div className="stoplights h-full w-[90px] dark:w-[75px]" />
          )}
          <button
            onClick={() => {
              dispatch(toggleIsOpen());
              if (gamelistIsOpen) {
                dispatch(setShowTutorialCard(false));
              }
            }}
            aria-label="toggle games list"
            className="relative ml-2 p-2 hover:bg-lightbg hover:bg-opacity-50 rounded-md"
            data-tip="Toggle games list"
          >
            <FontAwesomeIcon icon={faBars} />
            {/* CQ: this top param */}
            <span className="absolute text-sm left-[10px] top-[calc(0.25rem+var(--sat))]">
              {hamburgerNotification}
            </span>
          </button>
          <Popover
            positions={["bottom"]}
            content={<SettingsPage onDismiss={() => setSettingsPanel(false)} />}
            isOpen={settingsPanel}
            containerClassName="z-30 px-2"
          >
            <button
              onClick={() => {
                setSettingsPanel(true)
              }}
              aria-label="display tutorial"
              data-tip="Tutorial"
              className="p-2 rounded-md hover:bg-lightbg hover:bg-opacity-50"
            >
              <FontAwesomeIcon icon={faCog} />
            </button>
          </Popover>
          <Popover
            positions={["bottom"]}
            content={<TutorialCard shadow />}
            isOpen={!gamelistIsOpen && showTutorialCard}
            containerClassName="z-30 w-full max-w-[300px]"
          >
            <button
              onClick={() => {
                dispatch(setShowTutorialCard(true));
              }}
              aria-label="display tutorial"
              data-tip="Tutorial"
              className={classNames(
                "p-2 rounded-md hover:bg-lightbg hover:bg-opacity-50",
                gamelistIsOpen && showTutorialCard && "hidden"
              )}
            >
              <FontAwesomeIcon icon={faQuestion} />
            </button>
          </Popover>
        </div>
        <div className="h-full flex-auto window-drag" />
        <div className="flex items-center pr-2">
          {isLoading && (
            <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
          )}
          {!isLoading && !socketConnected && (
            <Button
              onClick={() => window.location.reload()}
              variant="quiet"
              className="mr-2"
            >
              <FontAwesomeIcon icon={faSyncAlt} />
            </Button>
          )}
          <FontAwesomeIcon
            className={socketConnected ? "text-green-500" : "text-gray-400"}
            icon={faCircle}
          />
          {showDownloadButton && (
            <Popover
              positions={["bottom"]}
              containerClassName="z-30 px-2"
              isOpen={nativeAppAd}
              content={<NativeAppAd />}
              onClickOutside={() => setNativeAppAd(false)}
            >
              <Button
                variant="quiet"
                onClick={() => setNativeAppAd(!nativeAppAd)}
                className="rounded-md"
              >
                Download
              </Button>
            </Popover>
          )}
          {isLoggedIn !== null && (
            <Popover
              positions={["bottom"]}
              containerClassName="z-30 px-2"
              isOpen={authPrompt}
              content={<AuthPrompt onDismiss={() => setAuthPrompt(false)} />}
            >
              {isLoggedIn ? (
                <Button
                  variant="quiet"
                  className="ml-0 rounded-md"
                  onClick={() => dispatch(logout())}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  variant="quiet"
                  onClick={() => setAuthPrompt(true)}
                  className="ml-0 rounded-md"
                >
                  Login
                </Button>
              )}
            </Popover>
          )}
          {PLATFORM === "win32" && <div className="w-[150px]"></div>}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
