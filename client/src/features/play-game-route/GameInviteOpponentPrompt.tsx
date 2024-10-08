import {
  faClipboard,
  faShareSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";
import useDimensions from "react-cool-dimensions";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import { useAppDispatch } from "../../app/hooks";
import { ActionButton } from "../../presentational/ActionButton";

import CopyToClipboard from "../../presentational/CopyToClipboard";
import { overlayStyles } from "../../presentational/Modal2";
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
      id="game-invite-opponent-prompt"
      ref={observe}
      className={twMerge(overlayStyles.base, "overflow-hidden absolute z-20")}
    >
      <div
        className={classNames(
          "flex-shrink-0 my-auto mx-0 h-full w-full flex items-center p-4 gap-4 overflow-auto",
          lg ? "justify-center" : "flex-col pt-6"
        )}
      >
        <div
          className={classNames(
            "flex-shrink-0 flex flex-col justify-center p-4 items-center",
            "rounded-xl bg-lighterbg shadow-lg w-full max-w-[450px]"
            // lg && "mr-0"
          )}
        >
          <span className="text-center">
            <h2 className="text-2xl font-bold flex-wrap leading-6">
              Invite an opponent
            </h2>
            <span className="text-sm text-text opacity-70 relative mt-[-5px]">
              to start this game.
            </span>
          </span>
          <span className="select-none text-text opacity-70 mt-4">
            scan this invite code
          </span>
          <QRCode
            className="bg-white/50 p-4 rounded-md border-4 border-gray-300"
            width={300}
            bgColor="transparent"
            value={gameUrl}
          />
          <span className="select-none text-text opacity-70 mt-4">
            or send this invite link
          </span>
          <div className="border-4 border-gray-300/50 bg-white/50 flex flex-wrap gap-2 p-2 rounded-lg justify-between items-center">
            <a
              className="underline text-textLink text-xs break-all"
              href={gameUrl}
            >
              {gameUrl}
            </a>
            <div className="flex gap-1 mt-1">
              <CopyToClipboard
                label={<FontAwesomeIcon icon={faClipboard} />}
                text={gameUrl}
              />
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
        <div className="flex-shrink-0 flex flex-col">
          <div
            className={classNames(
              "flex flex-col justify-center p-4 items-center",
              "rounded-xl bg-lighterbg shadow-lg w-full max-w-[450px]"
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
          <div className="w-full p-4 mt-4 rounded-xl bg-lighterbg shadow-lg max-w-[450px] text-center">
            {id && (
              <>
                You can also
                <ActionButton
                  colorClasses="bg-red-500 hover:bg-red-400 border-red-600 text-white inline mx-2"
                  onPress={() => {
                    dispatch(deleteGameById(id));
                    navigate("/");
                  }}
                >
                  <FontAwesomeIcon className="mr-2" icon={faTrash} />
                  Delete
                </ActionButton>
                this game
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
