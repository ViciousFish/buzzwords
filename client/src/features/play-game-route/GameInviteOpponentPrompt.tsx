import { faShareSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";

import Button from "../../presentational/Button";
import CopyToClipboard from "../../presentational/CopyToClipboard";
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

  return (
    <div className="flex flex-auto flex-col overflow-auto lg:h-[calc(100vh-50px)] justify-center items-center py-12 px-4 text-text">
      <div className="max-w-full flex-shrink-0 bg-darkbg flex flex-col justify-center items-center text-center p-8 rounded-xl mb-5">
        <h2 className="text-2xl flex-wrap">
          Invite an opponent to start the game
        </h2>
        <span>they can use this link to join you</span>
        <a
          className="underline text-textLink text-sm break-words"
          href={gameUrl}
        >
          {gameUrl}
        </a>
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
              className="bg-red-600 text-white"
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
      <div className=" bg-darkbg rounded-xl text-center">
        <h2 className="text-2xl">Watch the tutorial</h2>
        <span>in the mean time</span>
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
  );
}
