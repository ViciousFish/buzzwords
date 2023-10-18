import React, { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { Popover } from "react-tiny-popover";
import urljoin from "url-join";

import { useAppDispatch } from "../../app/hooks";
import Button from "../../presentational/Button";
import { joinGameById } from "../gamelist/gamelistActions";
import NativeAppAd from "../../presentational/NativeAppAd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { IS_MOBILE_BROWSER } from "../settings/SettingsPage";
import { User } from "../user/userSlice";
import { NewButton } from "../../presentational/NewButton";

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
    <div className="flex flex-auto flex-col overflow-auto lg:h-[calc(100vh-calc(50px+var(--sat)))] justify-center items-center py-8 px-4">
      <div className="max-w-full flex-shrink-0 bg-darkbg shadow-lg flex flex-col justify-center items-center text-center p-8 rounded-xl">
        <h2 className="text-2xl text-text flex-wrap mb-4">
          <span className="font-bold italic">
            {opponent?.nickname ?? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
            )}
          </span>{" "}
          has invited you to play Buzzwords
        </h2>
        <div className="flex items-center gap-2">
          <NewButton variant="green" onPress={joinGame}>Join game{!window.ipc && " here"}</NewButton>
          {/* IS_MOBILE_BROWSER is temporary */}
          {!window.ipc && !IS_MOBILE_BROWSER && (
            <div className="text-white bg-lighterbg rounded-full flex justify-center p-1">
              <NewButton variant="blue" onPress={launchApp}>
                Join game in app
              </NewButton>
              <Popover
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
              </Popover>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
