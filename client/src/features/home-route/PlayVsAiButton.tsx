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
  const onPlayAIClick = useCallback(
    (difficulty: number) => async () => {
      const game = await dispatch(createNewAIGame(difficulty));
      navigate(`/play/${game}`);
    },
    [navigate, dispatch]
  );
  const [showOptions, setShowOptions] = useState(false);
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
        data-tip={mode === "icon" ? "Create new game vs AI" : undefined}
        aria-label="create new game versus AI"
      >
        {mode === "homepage" ? (
          <>Play vs AI</>
        ) : (
          <FontAwesomeIcon icon={faRobot} />
        )}
      </Button>
      {showOptions && (
        <div
          ref={clickOutsideRef}
          className="bg-primary rounded-xl p-4 absolute shadow top-0 text-center"
        >
          <span>AI Difficulty</span>
          <div className="flex">
            <Button
              className="bg-darkbrown text-white"
              onClick={onPlayAIClick(1)}
            >
              1
            </Button>
            <Button
              className="bg-darkbrown text-white"
              onClick={onPlayAIClick(3)}
            >
              3
            </Button>
            <Button
              className="bg-darkbrown text-white"
              onClick={onPlayAIClick(5)}
            >
              5
            </Button>
            <Button
              className="bg-darkbrown text-white"
              onClick={onPlayAIClick(7)}
            >
              7
            </Button>
            <Button
              className="bg-darkbrown text-white"
              onClick={onPlayAIClick(9)}
            >
              9
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayVsAiButton;
