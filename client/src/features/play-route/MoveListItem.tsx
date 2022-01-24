import {
  faBook,
  faExclamationTriangle,
  faPlay,
  faPlayCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios, { AxiosError } from "axios";
import { Move } from "buzzwords-shared/Game";
import classNames from "classnames";
import React, { useCallback, useState } from "react";
import { Popover } from "react-tiny-popover";
import relativeDate from "tiny-relative-date";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
import { initiateReplay } from "../game/gameActions";

interface MoveListItemProps {
  move: Move;
  index: number;
}

const MoveListItem: React.FC<MoveListItemProps> = ({ move, index }) => {
  const dispatch = useAppDispatch();
  const replayState = useAppSelector((state) =>
    Boolean(state.game.replay.move)
  );
  const currentReplayIndex = useAppSelector(
    (state) => state.game.replay.moveListIndex
  );

  const [isOpen, setIsOpen] = useState(false);
  const [dictionaryData, setDictionaryData] = useState(null as any | null);

  const openPopover = useCallback(async () => {
    setIsOpen(true);
    try {
      const res = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${move.letters.join(
          ""
        )}`,
        { withCredentials: false }
      );
      setDictionaryData(res.data);
    } catch (e) {
      console.log(Object.keys(e))
      setDictionaryData({
        type: "error",
        status: e.response?.status
      });
    }
  }, [setIsOpen, move.letters]);

  const popoverContent = (
    <div className="bg-primary rounded-xl px-4 py-2 w-[300px] z-30 shadow-lg">
      <div className="flex justify-between items-baseline">
        <FontAwesomeIcon className="mr-2" icon={faBook} />
        <span className="capitalize text-4xl font-bold mr-2 font-serif">
          {move.letters.join("")}
        </span>
        <span className="flex-auto"></span>
        {move.date && (
          <span className="text-xs">{relativeDate(move.date)}</span>
        )}
      </div>

      {dictionaryData ? (
        <>
          {dictionaryData.type === "error" && (
            <div className="flex justify-center p-4 gap-1 items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} /> {dictionaryData.status}
            </div>
          )}
          {dictionaryData.type !== "error" && (
            <ul>
              {/* @ts-ignore */}
              {dictionaryData[0].meanings.map((meaning, index) => {
                console.log("meaning", meaning);
                return (
                  <li key={index}>
                    <p className="font-serif inline-block">
                      <span className="italic mr-2 opacity-50">
                        {meaning.partOfSpeech}
                      </span>
                      {meaning.definitions
                        .map((def) => def.definition)
                        .join(" ")}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : (
        <div className="flex justify-center p-4">
          <FontAwesomeIcon className="animate-spin" icon={faSpinner} />
        </div>
      )}
        <Button
          className={classNames(
            "bg-darkbrown text-white text-sm p-2 m-0 w-full",
            replayState && currentReplayIndex === index && "bg-blue-400 "
          )}
          onClick={() => {
            dispatch(initiateReplay(index));
          }}
          disabled={replayState}
        >
          <FontAwesomeIcon
            className="mr-2"
            icon={
              replayState && currentReplayIndex === index
                ? faPlay
                : faPlayCircle
            }
          />
          replay
        </Button>
    </div>
  );
  return (
    <Popover
      containerClassName="z-30"
      isOpen={isOpen}
      positions={["left", "top", "bottom"]}
      content={popoverContent}
      onClickOutside={() => setIsOpen(false)}
    >
      <li className={classNames(isOpen && "bg-primary", "flex")}>
        <button
          type="button"
          className={classNames(
            "flex-auto p-1 font-bold text-center rounded-md m-1 inset-shadow hover:bg-opacity-70",
            move.player === 0 ? "bg-p1" : "bg-p2"
          )}
          onClick={() => {
            if (!isOpen) {
              openPopover();
            } else {
              setIsOpen(false);
            }
          }}
        >
          {move.letters.join("").toUpperCase()}
        </button>
      </li>
    </Popover>
  );
};

export default MoveListItem;
