import { faRobot, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../app/hooks";
import Button from "../../presentational/Button";
import { useOutsideAlerter } from "../../utils/useOutsideAlerter";
import { createNewAIGame } from "../gamelist/gamelistActions";

const DifficultyButton: React.FC<{
  difficultyNumber: number;
  difficultyName: string;
  onPlayAIClick: (difficulty: number) => () => void;
  autoFocus?: boolean;
}> = ({
  difficultyName,
  difficultyNumber,
  onPlayAIClick,
  autoFocus,
}) => (
  <Button
    autoFocus={autoFocus}
    className="bg-darkbrown text-white"
    onClick={onPlayAIClick(difficultyNumber)}
    aria-label={`create ${difficultyName} difficulty game vs bot`}
  >
    {difficultyName}{" "}
    <span className="opacity-75 text-sm">({difficultyNumber})</span>
  </Button>
);

interface PlayVsAiButtonProps {
  mode: "icon" | "homepage";
}

const PlayVsAiButton: React.FC<PlayVsAiButtonProps> = ({ mode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onPlayAIClick = useCallback(
    (difficulty: number) => async () => {
      setIsSubmitting(true);
      try {
        const game = await dispatch(createNewAIGame(difficulty));
        setShowOptions(false);
        navigate(`/play/${game}`);
      } catch (e) {
        setIsSubmitting(false);
        toast(e, {
          type: "error",
        });
      }
    },
    [navigate, dispatch]
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
        {mode === "homepage" ? (
          <span className="ml-2">Play vs computer</span>
        ) : null}
      </Button>
      {showOptions && (
        <div
          ref={clickOutsideRef}
          className="bg-primary rounded-xl p-4 absolute shadow-lg top-0 text-center z-10"
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon className="animate-spin" icon={faSpinner} />
              <span className="ml-2 text-sm">setting up game</span>
            </>
          ) : (
            <>
              <span>Computer Difficulty</span>
              <div className="flex flex-col">
                <DifficultyButton
                  autoFocus
                  difficultyName="Beginner"
                  difficultyNumber={1}
                  onPlayAIClick={onPlayAIClick}
                />
                <DifficultyButton
                  autoFocus
                  difficultyName="Easy"
                  difficultyNumber={3}
                  onPlayAIClick={onPlayAIClick}
                />
                <DifficultyButton
                  autoFocus
                  difficultyName="Medium"
                  difficultyNumber={5}
                  onPlayAIClick={onPlayAIClick}
                />
                <DifficultyButton
                  autoFocus
                  difficultyName="Hard"
                  difficultyNumber={6}
                  onPlayAIClick={onPlayAIClick}
                />
                <DifficultyButton
                  autoFocus
                  difficultyName="Harder"
                  difficultyNumber={7}
                  onPlayAIClick={onPlayAIClick}
                />
                <DifficultyButton
                  autoFocus
                  difficultyName="Expert"
                  difficultyNumber={8}
                  onPlayAIClick={onPlayAIClick}
                />
                <DifficultyButton
                  autoFocus
                  difficultyName="Expert+"
                  difficultyNumber={9}
                  onPlayAIClick={onPlayAIClick}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayVsAiButton;
