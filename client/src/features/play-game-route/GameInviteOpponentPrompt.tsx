import { faShareSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";
import useDimensions from "react-cool-dimensions";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { ActionButton } from "../../presentational/ActionButton";

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
      style={{
        justifyContent: lg ? "safe center" : "",
      }}
      className={classNames(
        "w-full flex flex-col items-center h-full overflow-auto text-text"
      )}
    >
      <div
        className={classNames(
          "max-w-[1200px] w-full flex flex-shrink-0 gap-4 p-4",
          lg ? "flex-row items-center" : "flex-col items-center"
        )}
      >
        <div
          className={classNames(
            "flex flex-col justify-center p-4 gap-2",
            "rounded-xl bg-lighterbg shadow-lg w-full max-w-[500px]"
            // lg && "mr-0"
          )}
        >
          <h2 className="text-2xl font-bold flex-wrap">
            Invite an opponent to start the game
          </h2>
          <span className="select-none text-black opacity-70 ">
            send your opponent this link
          </span>
          <div className="border-4 border-gray-300/50 bg-white/50 flex flex-wrap p-2 rounded-lg justify-between items-center">
            <a
              className="underline text-textLink break-words text-sm break-all"
              href={gameUrl}
            >
              {gameUrl}
            </a>
            <div className="flex gap-1 mt-1">
              <CopyToClipboard label="Copy" text={gameUrl} />
              {navigator.share && (
                <ActionButton
                  onPress={() => {
                    navigator.share?.({
                      url: gameUrl,
                    });
                  }}
                >
                  Share <FontAwesomeIcon icon={faShareSquare} />
                </ActionButton>
              )}
            </div>
          </div>
          <span className="select-none text-black opacity-70 ">
            or have them scan this code
          </span>
          <div
            className={classNames(
              "max-w-full aspect-square border-4 border-gray-300/50 bg-white/50",
              "self-start flex flex-col p-2 rounded-lg justify-between items-center"
            )}
          >
            <QRCode bgColor="transparent" value={gameUrl} />
          </div>
        </div>
        <div className="flex flex-col">
          <div
            className={classNames(
              "flex flex-col justify-center p-4 ",
              "rounded-xl bg-lighterbg shadow-lg w-full max-w-[500px]"
              // lg && "ml-0"
            )}
          >
            <span className="opacity-75">in the mean time</span>
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
          <div className=" p-4 mt-4 rounded-xl bg-lighterbg shadow-lg max-w-[500px] self-start">
            {id && (
              <>
                You can also
                <ActionButton
                  className="bg-red-500 hover:bg-red-400 border-red-600 text-white inline mx-2"
                  onPress={() => {
                    dispatch(deleteGameById(id));
                    navigate("/");
                  }}
                >
                  <FontAwesomeIcon className="mr-2" icon={faTrash} />
                  Delete
                </ActionButton>
                this link
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
