import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import Button from "../../presentational/Button";
import { useOutsideAlerter } from "../../utils/useOutsideAlerter";
import { createNewAIGame } from "../gamelist/gamelistActions";

interface PlayVsAiButtonProps {
  mode: "icon" | "homepage";
}

const PlayVsAiButton: React.FC<PlayVsAiButtonProps> = ({ mode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const onPlayAIClick = useCallback(
    (difficulty: number) => async () => {
      const game = await dispatch(createNewAIGame(difficulty));
      setShowOptions(false);
      if (mode === "homepage") {
        navigate(`/play/${game}`);
      }
    },
    [navigate, dispatch, mode]
  );
  const clickOutsideRef = useRef<HTMLDivElement>(null);
  const onClickOutside = useCallback(() => {
    setShowOptions(false);
  }, [setShowOptions]);
  useOutsideAlerter(clickOutsideRef, onClickOutside);

  return (
    <div className="inline relative">
      <Button
        className={classNames(
          mode === "homepage"
            ? "p-4 text-2xl relative mt-[0vw]"
            : "w-[42px] h-[42px] inline-flex items-center justify-center"
        )}
        onClick={() => setShowOptions(true)}
        data-tip={mode === "icon" ? "Create new game vs computer" : undefined}
        aria-label="create new game versus computer"
      >
        <FontAwesomeIcon icon={faRobot} />
        {mode === "homepage" ? <span className="ml-2">Play vs computer</span> : null}
      </Button>
      {showOptions && (
        <div
          ref={clickOutsideRef}
          className="bg-primary rounded-xl p-4 absolute shadow-lg top-0 text-center z-10"
        >
          <span>Computer Difficulty</span>
          <div className="flex flex-col">
            <Button
              autoFocus
              className="bg-darkbrown text-white"
              onClick={onPlayAIClick(1)}
              aria-label="beginner difficulty"
            >
              beginner
            </Button>
            <Button
              className="bg-darkbrown text-white"
              onClick={onPlayAIClick(3)}
              aria-label="easy difficulty"
            >
              easy
            </Button>
            <Button
              className="bg-darkbrown text-white"
              onClick={onPlayAIClick(5)}
              aria-label="medium difficulty"
            >
              medium
            </Button>
            <Button
              className="bg-darkbrown text-white"
              onClick={onPlayAIClick(7)}
              aria-label="hard difficulty"
            >
              hard
            </Button>
            <Button
              className="bg-darkbrown text-white"
              onClick={onPlayAIClick(9)}
              aria-label="expert difficulty"
            >
              expert
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayVsAiButton;