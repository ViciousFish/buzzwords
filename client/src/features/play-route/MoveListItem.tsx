import {
  faBook,
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
  const [dictionaryData, setDictionaryData] = useState(null);

  const openPopover = useCallback(() => {
    setIsOpen(true);
    axios
      .get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${move.letters.join(
          ""
        )}`,
        { withCredentials: false }
      )
      .then((res) => {
        setDictionaryData(res.data);
        console.log("res.data", res.data);
      });
  }, [setIsOpen, move.letters]);

  const popoverContent = (
    <div className="bg-primary rounded-xl px-4 py-2 w-[250px]">
      <div className="flex justify-end">
        <Button
          className={classNames(
            "bg-darkbrown text-white text-sm p-2 m-0 rounded-md",
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
      <div className="flex justify-between items-baseline">
        <FontAwesomeIcon className="mr-2" icon={faBook} />
        <span className="capitalize text-xl font-bold mr-2">
          {move.letters.join("")}
        </span>
        <span className="flex-auto"></span>
        {move.date && (
          <span className="text-sm">{relativeDate(move.date)}</span>
        )}
      </div>

      {dictionaryData ? (
        <>
          {JSON.stringify(
            dictionaryData[0].meanings.map((meaning) => [
              meaning.partOfSpeech,
              meaning.definitions.map((def) => def.definition),
            ])
          )}
        </>
      ) : (
        <div className="flex justify-center p-4">
          <FontAwesomeIcon className="animate-spin" icon={faSpinner} />
        </div>
      )}
    </div>
  );
  return (
    <Popover
      isOpen={isOpen}
      positions={["left"]}
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
