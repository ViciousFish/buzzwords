import { faShareSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";
import useDimensions from "react-cool-dimensions";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { ActionButton } from "../../presentational/ActionButton";

import CopyToClipboard from "../../presentational/CopyToClipboard";
import {
  INPUT_BG,
  INPUT_BORDER,
  INPUT_TEXT,
} from "../../presentational/InputColors";
import { WIZARD_BREAKPOINTS } from "../create-game-route/CreateGame";
import { deleteGameById } from "../gamelist/gamelistActions";

interface GameInviteOpponentPromptProps {
  id: string;
  gameUrl: string;
}

const COLORS =
  "bg-beeYellow-200 dark:bg-beeYellow-700 text-beeYellow-950 dark:text-beeYellow-200";

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
        "w-full flex flex-col items-center h-full overflow-auto", INPUT_TEXT
      )}
    >
      <div
        className={classNames(
          "max-w-[1000px] w-full flex flex-shrink-0 gap-4 p-4",
          lg ? "flex-row items-center" : "flex-col items-center"
        )}
      >
        <div
          className={classNames(
            "flex flex-col justify-center p-4 items-center",
            "rounded-xl shadow-lg w-full max-w-[500px]",
            COLORS
            // lg && "mr-0"
          )}
        >
          <span className="text-center">
            <h2 className="text-2xl font-bold flex-wrap leading-6">
              Invite an opponent
            </h2>
            <span className="text-sm opacity-70 relative mt-[-5px]">
              to start the game.
            </span>
          </span>
          <span className="select-none opacity-70 mt-4">
            scan this invite code
          </span>
          <QRCode
            className={classNames(
              // INPUT_BORDER,
              "border-2 border-bYellow-900",
              "bg-bYellow-100 dark:bg-bYellow-600",
              "fill-bBrown-900",
              "p-4 rounded-md"
            )}
            fgColor="unset"
            width={300}
            bgColor="transparent"
            value={gameUrl}
          />
          <span className="select-none text-text opacity-70 mt-4">
            or send this invite link
          </span>
          <div
            className={classNames(
              " flex flex-wrap gap-2 p-2 rounded-lg justify-between items-center",
              INPUT_BG,
              INPUT_BORDER
            )}
          >
            <a
              className={classNames("underline text-xs break-all", INPUT_TEXT)}
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
        </div>
        <div className="flex flex-col">
          <div
            className={classNames(
              "flex flex-col justify-center p-4 items-center",
              "rounded-xl shadow-lg w-full max-w-[500px]",
              COLORS
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
          <div
            className={classNames(
              COLORS,
              "w-full p-4 mt-4 rounded-xl shadow-lg max-w-[500px] text-center"
            )}
          >
            {id && (
              <>
                You can also
                <ActionButton
                  colorClasses="bg-red-500 hover:bg-red-600 border-red-600 hover:border-red-700 text-white inline mx-2"
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
