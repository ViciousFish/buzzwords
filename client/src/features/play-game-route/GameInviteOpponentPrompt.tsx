import { faShareSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";
import useDimensions from "react-cool-dimensions";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";

import Button from "../../presentational/Button";
import CopyToClipboard from "../../presentational/CopyToClipboard";
import { WIZARD_BREAKPOINTS } from "../create-game-route/CreateGame";
import { deleteGameById } from "../gamelist/gamelistActions";

interface GameInviteOpponentPromptProps {
  id: string;
  gameUrl: string;
}

export default function GameInviteOpponentPrompt({
  gameUrl,
  id,
}: GameInviteOpponentPromptProps) {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { currentBreakpoint, observe } = useDimensions({
    breakpoints: WIZARD_BREAKPOINTS,
    updateOnBreakpointChange: true,
  });

  const lg = currentBreakpoint === "lg";
  return (
    <div
      ref={observe}
      className={classNames(
        "w-full flex flex-col items-center h-full overflow-scroll text-text",
        lg && "justify-center"
      )}
    >
      <div
        className={classNames(
          "max-w-[1200px] w-full flex flex-shrink-0 gap-8 p-4",
          lg ? "flex-row items-center" : "flex-col items-stretch"
        )}
      >
        <div
          className={classNames(
            "flex flex-col justify-center p-4 mx-4",
            "rounded-xl bg-lighterbg shadow-lg",
            lg && "mr-0 w-full"
          )}
        >
          <h2 className="text-2xl font-bold flex-wrap">
            Invite an opponent to start the game
          </h2>
          <div className="my-4 border-4 border-orange-400 bg-orange-200 flex p-2 rounded justify-between">
            <div className="flex flex-col">
              <span className="select-none text-black text-sm opacity-70">
                send your opponent this link
              </span>

              <a className="underline text-textLink break-words" href={gameUrl}>
                {gameUrl}
              </a>
            </div>
          </div>
          <div>
            <CopyToClipboard label="Copy link" text={gameUrl} />
            {navigator.share && (
              <Button
                onClick={() => {
                  navigator.share?.({
                    url: gameUrl,
                  });
                }}
              >
                Share <FontAwesomeIcon icon={faShareSquare} />{" "}
              </Button>
            )}
            {id && (
              <Button
                className="bg-red-800 text-white"
                onClick={() => {
                  dispatch(deleteGameById(id));
                  navigate("/");
                }}
              >
                <FontAwesomeIcon className="mr-2" icon={faTrash} />
                Delete
              </Button>
            )}
          </div>
        </div>
        <div
          className={classNames(
            "flex flex-col justify-center p-4 mx-4",
            "rounded-xl bg-lighterbg shadow-lg",
            lg && "ml-0 w-full"
          )}
        >
          <span className="text-sm opacity-75">in the mean time</span>
          <h2 className="text-2xl font-bold">Watch the tutorial</h2>
          <iframe
            style={{
              maxWidth: "100%",
              width: "560px",
            }}
            height="315"
            src="https://www.youtube.com/embed/MwULUSGQ9oo"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="border-darkbrown border-2 rounded-lg"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
