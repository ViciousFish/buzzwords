import {
  faBars,
  faCircle,
  faQuestion,
  faSpinner,
  faVolumeMute,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React, { useCallback, useState } from "react";
import { Popover } from "react-tiny-popover";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
import { setTurnNotificationsMute } from "../game/gameSlice";
import { getHowManyGamesAreMyTurn } from "../gamelist/gamelistSelectors";
import { setShowTutorialCard, toggleIsOpen } from "../gamelist/gamelistSlice";
import TutorialCard from "../gamelist/TutorialCard";
import { logout } from "../user/userActions";
import { isUserLoggedIn } from "../user/userSelectors";
import AuthPrompt from "./AuthPrompt";

const TopBar: React.FC = () => {
  const dispatch = useAppDispatch();

  const isOpen = useAppSelector((state) => state.gamelist.isOpen);
  const turnNotificationsMuted = useAppSelector(
    (state) => state.game.turnNotificationsMuted
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
    !window.location.toString().match(/play/)
  ); // CQ: temp
  const authPrompt = isLoggedIn === false && _authPrompt;

  const isLoading =
    isRefreshing || (currentGame && gamesLoading[currentGame] === "loading");

  const toggleTurnNotificationsMute = useCallback(() => {
    dispatch(setTurnNotificationsMute(!turnNotificationsMuted));
  }, [dispatch, turnNotificationsMuted]);

  let hamburgerNotification;
  if (!isOpen && currentTurnCount) {
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
        "h-[50px] w-screen shadow-md"
      )}
    >
      <div className="topbar rounded-t-xl flex justify-between h-full px-4 items-center">
        <div className="flex">
          <button
            onClick={() => {
              dispatch(toggleIsOpen());
              if (isOpen) {
                dispatch(setShowTutorialCard(false));
              }
            }}
            aria-label="toggle games list"
            className="p-2 hover:bg-lightbg hover:bg-opacity-50 rounded-md"
            data-tip="Toggle games list"
          >
            <FontAwesomeIcon icon={faBars} />
            <span className="absolute text-sm left-[10px] top-1">
              {hamburgerNotification}
            </span>
          </button>
          <button
            className="p-2 rounded-md hover:bg-lightbg hover:bg-opacity-50"
            aria-label={`${
              turnNotificationsMuted ? "unmute" : "mute"
            } turn notification`}
            data-tip={`${
              turnNotificationsMuted ? "Unmute" : "Mute"
            } turn notification`}
            onClick={toggleTurnNotificationsMute}
          >
            <FontAwesomeIcon
              icon={turnNotificationsMuted ? faVolumeMute : faVolumeUp}
            />
          </button>
          <Popover
            positions={["bottom"]}
            content={<TutorialCard shadow />}
            isOpen={!isOpen && showTutorialCard}
            containerClassName="z-30 w-full max-w-[300px]"
          >
            <button
              onClick={() => {
                dispatch(setShowTutorialCard(true));
              }}
              aria-label="display tutorial"
              data-tip="Tutorial"
              className={classNames(
                "p-2 rounded-md hover:bg-primary hover:bg-opacity-50",
                isOpen && showTutorialCard && "hidden"
              )}
            >
              <FontAwesomeIcon icon={faQuestion} />
            </button>
          </Popover>
        </div>
        <div className="flex items-baseline">
          {isLoading && (
            <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
          )}
          <FontAwesomeIcon
            className={socketConnected ? "text-green-500" : "text-gray-400"}
            icon={faCircle}
          />
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
                  className="p-2 rounded-md"
                  onClick={() => dispatch(logout())}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  variant="quiet"
                  onClick={() => setAuthPrompt(true)}
                  className="p-2 rounded-md"
                >
                  Login
                </Button>
              )}
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
