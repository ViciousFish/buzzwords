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
  let word = move.forfeit ? "resign" : move.letters.join("");

  return (
      <li className="flex flex-shrink-0">
        <button
          type="button"
          className={classNames(
            "flex-auto px-2 py-1 font-bold text-text text-center rounded-full m-1 inset-shadow",
            isSelected && "outline-darkbrown outline",
            move.player === 0 ? "bg-p1" : "bg-p2"
          )}
          onClick={onPress}
        >
          {word.toUpperCase()}
        </button>
      </li>
  );
};

export default MoveListItem;
