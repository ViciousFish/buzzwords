import {
  faBook,
  faExclamationTriangle,
  faPlay,
  faPlayCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { Move } from "buzzwords-shared/Game";
import classNames from "classnames";
import React, { useCallback, useState } from "react";
import { Popover } from "react-tiny-popover";
import relativeDate from "tiny-relative-date";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
import { initiateReplay } from "../game/gameActions";
import { clearReplay } from "../game/gameSlice";

interface MoveListItemProps {
  move: Move;
  index: number;
  onPress: () => void;
  isSelected: boolean;
}

const MoveListItem: React.FC<MoveListItemProps> = ({
  move,
  index,
  onPress,
  isSelected,
}) => {
  const dispatch = useAppDispatch();
  const replayState = useAppSelector((state) =>
    Boolean(state.game.replay.move)
  );
  const currentReplayIndex = useAppSelector(
    (state) => state.game.replay.moveListIndex
  );

  const [isOpen, setIsOpen] = useState(false);
  const [dictionaryData, setDictionaryData] = useState(null as any | null);

  let word = move.letters.join("");
  if (move.forfeit) {
    word = "resign";
  }

  const popoverContent = (
    <div
      className={classNames(
        "bg-darkbg rounded-xl px-4 py-2 w-[300px] z-30 shadow-lg border-b-4 border-r-4 text-text",
        move.player === 0 ? "border-p1" : "border-p2"
      )}
    >
      <div className="flex justify-between items-baseline">
        <span className="capitalize text-4xl font-bold mr-2 font-serif">
          {word}
        </span>
        <span className="flex-auto"></span>
        {move.date && (
          <span
            title={new Date(move.date).toLocaleString()}
            className="text-xs opacity-50"
          >
            {relativeDate(move.date)}
          </span>
        )}
      </div>

      {dictionaryData ? (
        <>
          {dictionaryData.type === "error" && (
            <div className="flex justify-center p-4 gap-1 items-center">
              <FontAwesomeIcon className="mr-1" icon={faBook} />
              <FontAwesomeIcon className="mr-1" icon={faExclamationTriangle} />
              {dictionaryData.status}
            </div>
          )}
          {dictionaryData.type !== "error" && (
            <ul className="text-sm">
              {/* @ts-ignore */}
              {dictionaryData[0].meanings.map((meaning, index) => {
                return (
                  <li key={index} className="mb-2">
                    <p className="font-serif inline-block opacity-75">
                      <span className="italic mr-2 opacity-75">
                        {meaning.partOfSpeech}
                      </span>
                      {meaning.definitions
                        .map((def) => def.definition)
                        .join("/")}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : (
        <div className="flex justify-center p-4">
          <FontAwesomeIcon className="mr-2" icon={faBook} />
          <FontAwesomeIcon className="animate-spin" icon={faSpinner} />
        </div>
      )}
      {!move.forfeit ? (
        <Button
          className={classNames(
            "text-sm p-2 m-0 w-full",
            replayState &&
              currentReplayIndex === index &&
              "bg-blue-400 text-white",
            replayState && "bg-gray-300 hover:bg-red-500"
          )}
          onClick={() => {
            if (replayState) {
              return dispatch(clearReplay());
            }
            dispatch(initiateReplay(index));
            setIsOpen(false);
            onPress();
          }}
        >
          <FontAwesomeIcon
            className="mr-2"
            icon={
              replayState && currentReplayIndex === index
                ? faPlay
                : faPlayCircle
            }
          />
          Replay
        </Button>
      ) : (
        <div className="text-center font-serif italic p-2 mx-2 border border-darkbrown rounded-xl">
          Player {move.player + 1} resigned
        </div>
      )}
    </div>
  );
  return (
    // <Popover
    //   containerClassName="z-30"
    //   isOpen={isOpen}
    //   positions={["left", "top", "bottom"]}
    //   content={popoverContent}
    //   onClickOutside={() => setIsOpen(false)}
    // >
      <li className="flex flex-shrink-0">
        <button
          type="button"
          className={classNames(
            "flex-auto p-1 font-bold text-text text-center rounded-full m-1 hover:bg-opacity-70 inset-shadow",
            isSelected && "outline-darkbrown outline",
            move.player === 0 ? "bg-p1" : "bg-p2"
          )}
          onClick={onPress}
        >
          {word.toUpperCase()}
        </button>
      </li>
    // </Popover>
  );
};

export default MoveListItem;
