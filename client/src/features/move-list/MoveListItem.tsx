import { Move } from "buzzwords-shared/Game";
import classNames from "classnames";
import React, { useEffect, useRef } from "react";
import { usePrevious } from "../../utils/usePrevious";

interface MoveListItemProps {
  move: Move;
  onPress: () => void;
  isSelected: boolean;
  scrollOnSelection?: boolean;
}

const MoveListItem: React.FC<MoveListItemProps> = ({
  move,
  onPress,
  isSelected,
  scrollOnSelection,
}) => {
  let word = move.forfeit ? "resign" : move.letters.join("");

  const ref = useRef<HTMLLIElement>(null);
  let prevScroll = usePrevious(scrollOnSelection);
  useEffect(() => {
    if (scrollOnSelection && isSelected && !prevScroll) {
      ref.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isSelected, prevScroll, scrollOnSelection]);

  return (
    <li className="flex flex-shrink-0" ref={ref}>
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
