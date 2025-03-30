import React, { useCallback, useState } from "react";
import {
  faBars,
  faCircle,
  faCog,
  faDownload,
  faSignOut,
  faSpinner,
  faSyncAlt,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { useLocation } from "react-router";
import { Popover } from "react-tiny-popover";
import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import NativeAppAd from "../../presentational/NativeAppAd";
import { getHowManyGamesAreMyTurn } from "../gamelist/gamelistSelectors";
import { setShowTutorialCard, toggleIsOpen } from "../gamelist/gamelistSlice";
import TutorialCard from "../gamelist/TutorialCard";
import { logout } from "../user/userActions";
import { isUserLoggedIn } from "../user/userSelectors";
import AuthPrompt from "./AuthPrompt";
import { IS_MOBILE_BROWSER, SettingsPage } from "../settings/SettingsPage";
import { TopBarButton } from "./TopBarButton";

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

  const [_authPrompt, setAuthPrompt] = useState(false); // TODO: set up a timer or something to prompt user for auth
  const authPrompt = isLoggedIn === false && _authPrompt;

  const [settingsPanel, setSettingsPanel] = useState(false);

  const [nativeAppAd, setNativeAppAd] = useState(false);
  const showDownloadButton =
    !window.ipc && !location.pathname.match(/download/) && !IS_MOBILE_BROWSER;

  const isLoading =
    isRefreshing || (currentGame && gamesLoading[currentGame] === "loading");

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
        "fixed bottom-0 z-30 text-beeYellow-800",
        // "bg-gradient-to-t from-bBrown-950 to-bBrown-900",
        "bg-bBrown-900",
        "h-[calc(50px+var(--sat))] w-screen p-t-safe"
      )}
    >
      <div className="flex h-full p-0 items-center topbar">
        <div className="flex h-full gap-2 items-center">
          {PLATFORM === "darwin" && (
            <div className="stoplights h-full w-[90px] dark:w-[75px] mr-2" />
          )}
          <TopBarButton
            className="ml-4 mr-1"
            onPress={() => {
              dispatch(toggleIsOpen());
              if (gamelistIsOpen) {
                dispatch(setShowTutorialCard(false));
              }
            }}
          >
            {/* <FontAwesomeIcon icon={faBars} /> */}
            <span>Menu</span>
            <span className="absolute text-sm left-[14px] top-[calc(0.25rem+var(--sat))]">
              {hamburgerNotification}
            </span>
          </TopBarButton>
          <Popover
            positions={["bottom"]}
            content={<SettingsPage onDismiss={() => setSettingsPanel(false)} />}
            isOpen={settingsPanel}
            containerClassName="z-30 px-2"
          >
            <TopBarButton
              onPress={() => {
                setSettingsPanel(true);
              }}
              aria-label="toggle game settings"

              // className="p-2 rounded-md hover:bg-lightbg hover:bg-opacity-50"
            >
              {/* <FontAwesomeIcon icon={faCog} /> */}
              <span>Settings</span>
            </TopBarButton>
          </Popover>
          <Popover
            positions={["top"]}
            content={<TutorialCard shadow />}
            isOpen={!gamelistIsOpen && showTutorialCard}
            containerClassName="z-30 w-full max-w-[300px]"
          >
            <TopBarButton
              onPress={() => {
                dispatch(setShowTutorialCard(true));
              }}
              aria-label="display tutorial"
              className={classNames(
                gamelistIsOpen && showTutorialCard && "hidden"
              )}
            >
              {/* <FontAwesomeIcon icon={faCircleQuestion} /> */}
              <span className={classNames("p-2 rounded",showTutorialCard && "border")}>Tutorial</span>
            </TopBarButton>
          </Popover>
          <TopBarButton>
            <span className={classNames("p-2 rounded","border")}>Chuck vs Computer (5)</span>
          </TopBarButton>
        </div>
        <div className="h-full flex-auto window-drag" />
        <div className="flex items-center pr-2 mr-2 gap-2">
          {isLoading && (
            <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
          )}
          {!isLoading && !socketConnected && (
            <TopBarButton
              onPress={() => window.location.reload()}
              className="mr-2"
            >
              <FontAwesomeIcon icon={faSyncAlt} />
            </TopBarButton>
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
              <TopBarButton
                className="ml-2"
                onPress={() => setNativeAppAd(!nativeAppAd)}
              >
                <FontAwesomeIcon icon={faDownload} />
              </TopBarButton>
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
                <TopBarButton
                  className="ml-2 rounded-md"
                  onPress={() => dispatch(logout())}
                >
                  <FontAwesomeIcon icon={faSignOut} />
                </TopBarButton>
              ) : (
                <TopBarButton
                  onPress={() => setAuthPrompt(true)}
                  className="ml-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faUser} />
                </TopBarButton>
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
