import {
  faBars,
  faCircle,
  faQuestion,
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
import {
  getHowManyGamesAreMyTurn,
  getUnseenMoveCount,
} from "../gamelist/gamelistSelectors";
import { setShowTutorialCard, toggleIsOpen } from "../gamelist/gamelistSlice";
import TutorialCard from "../gamelist/TutorialCard";
import { logout } from "../user/userActions";
import { isUserLoggedIn } from "../user/userSelectors";
import AuthPrompt from "./AuthPrompt";

const TopBar: React.FC = () => {
  const dispatch = useAppDispatch();

  const currentTurnCount = useAppSelector(getHowManyGamesAreMyTurn);
  const currentUnseenCount = useAppSelector(getUnseenMoveCount);
  const isOpen = useAppSelector((state) => state.gamelist.isOpen);
  const turnNotificationsMuted = useAppSelector(
    (state) => state.game.turnNotificationsMuted
  );
  const showTutorialCard = useAppSelector(
    (state) => state.gamelist.showTutorialCard
  );

  const isLoggedIn = useAppSelector(isUserLoggedIn);

  const [_authPrompt, setAuthPrompt] = useState(true);
  const authPrompt = isLoggedIn === false && _authPrompt;

  const toggleTurnNotificationsMute = useCallback(() => {
    dispatch(setTurnNotificationsMute(!turnNotificationsMuted));
  }, [dispatch, turnNotificationsMuted]);

  let hamburgerNotification;
  if (!isOpen && (currentTurnCount || currentUnseenCount)) {
    hamburgerNotification = (
      <FontAwesomeIcon
        className={classNames(
          currentUnseenCount ? "text-blue-500" : "text-yellow-700",
          "drop-shadow"
        )}
        icon={faCircle}
      />
    );
  }
  return (
    <div
      className={classNames(
        "fixed top-0 z-30 md:bg-black text-darkbrown",
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
            containerClassName="z-30 max-w-[300px] w-[50vw]"
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
        <div className="flex">
          {isLoggedIn !== null && <Popover
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
          </Popover>}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
