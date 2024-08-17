import React, { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import urljoin from "url-join";
import { Button as AriaButton } from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

import { useAppDispatch } from "../../app/hooks";
import {
  getHasDismissedTutorialCard,
  joinGameById,
} from "../gamelist/gamelistActions";
import { IS_MOBILE_BROWSER } from "../settings/SettingsPage";
import { User } from "../user/userSlice";
import { FancyButton } from "../../presentational/FancyButton";
import { overlayStyles } from "../../presentational/Modal2";
import { setShowTutorialCard } from "../gamelist/gamelistSlice";

interface GameInvitationProps {
  id: string;
  setFourohfour: (gameNotFound: boolean) => void;
  opponent: User | null;
}

export default function GameInvitation({
  id,
  setFourohfour,
  opponent,
}: GameInvitationProps) {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const [appInfoOverlay, setAppInfoOverlay] = useState(false);

  const joinGame = useCallback(() => {
    if (id) {
      dispatch(joinGameById(id)).then((joinedGame) => {
        if (!getHasDismissedTutorialCard()) {
          dispatch(setShowTutorialCard(true));
        }
        if (!joinedGame) {
          setFourohfour(true);
        }
      });
    }
  }, [id, dispatch, setFourohfour]);

  const launchApp = useCallback(() => {
    const path = location.pathname;
    console.log(
      urljoin(`${import.meta.env.VITE_PRIVATE_SCHEME_NAME}://`, path)
    );
    // @ts-ignore
    window.location = urljoin(
      `${import.meta.env.VITE_PRIVATE_SCHEME_NAME}://`,
      path
    );
  }, [location]);

  return (
    <div
      className={twMerge(
        overlayStyles.base,
        "flex flex-auto flex-col overflow-auto justify-center items-center absolute"
      )}
    >
      <div className="max-w-full flex-shrink-0 bg-darkbg shadow-lg flex flex-col justify-center items-center text-center p-8 rounded-xl">
        <h2 className="text-2xl text-text flex-wrap mb-4">
          <span className="font-bold text-p1 p-2 bg-darkbrown">
            {opponent?.nickname ?? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
            )}
          </span>{" "}
          challenges you to{" "}
          <img
            className="inline drop-shadow mb-1 ml-1 relative bottom-1"
            style={{ width: 30, height: 30 }}
            src="/bee.png"
          />{" "}
          <span className="text-darkbrown font-fredoka inline-flex">
            BUZZWORDS
          </span>
        </h2>
        <div className="flex flex-col gap-2">
          <FancyButton className="font-bold text-xl" onPress={joinGame}>
            Join game
          </FancyButton>
          {/* IS_MOBILE_BROWSER is temporary */}
          {!window.ipc && !IS_MOBILE_BROWSER && (
            <div className="flex text-xs justify-center items-baseline">
              <AriaButton className="text-text underline" onPress={launchApp}>
                Launch desktop client
              </AriaButton>
              {/* <Popover
                content={<NativeAppAd />}
                isOpen={appInfoOverlay}
                onClickOutside={() => setAppInfoOverlay(false)}
              >
                <Button
                  variant="quiet"
                  className="ml-0 text-textSubtle"
                  onClick={() => setAppInfoOverlay(!appInfoOverlay)}
                >
                  <FontAwesomeIcon icon={faInfoCircle} />
                </Button>
              </Popover> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
