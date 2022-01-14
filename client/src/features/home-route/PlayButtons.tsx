import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { faRobot, faSpinner, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { Popover } from "react-tiny-popover";

import { useAppDispatch } from "../../app/hooks";
import Button from "../../presentational/Button";
import { createNewAIGame, createNewGame } from "../gamelist/gamelistActions";

const DifficultyButton: React.FC<{
  difficultyNumber: number;
  difficultyName: string;
  onPlayAIClick: (difficulty: number) => () => void;
  autoFocus?: boolean;
}> = ({ difficultyName, difficultyNumber, onPlayAIClick, autoFocus }) => (
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

interface PlayButtonsProps {
  mode: "text" | "icon" | "shorttext";
  buttonClasses?: string;
}

const PlayButtons: React.FC<PlayButtonsProps> = ({ mode, buttonClasses }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [showOptions, setShowOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onPlayOnlineClick = useCallback(async () => {
    try {
      const game = await dispatch(createNewGame());
      navigate(`/play/${game}`);
    } catch (e) {
      toast(e, {
        type: "error",
      });
    }
  }, [navigate, dispatch]);

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
  return (
    <>
      <Button
        className={classNames(
          mode === "text" || mode === "shorttext"
            ? "relative"
            : "w-[42px] h-[42px] inline-flex items-center justify-center",
          buttonClasses
        )}
        onClick={onPlayOnlineClick}
        data-tip="Create new game vs human"
      >
        <FontAwesomeIcon icon={faUser} />
        {mode === "text" && <span className="ml-2">Play vs human</span>}
        {mode === "shorttext" && <span className="ml-2">Human</span>}
      </Button>

      <Popover
        isOpen={showOptions}
        containerClassName="z-40"
        onClickOutside={() => setShowOptions(false)}
        content={
          <div
            // ref={clickOutsideRef}
            className="bg-primary rounded-xl p-4 shadow-lg text-center"
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
        }
      >
        <Button
          className={classNames(
            mode === "text" || mode === "shorttext"
              ? "relative"
              : "w-[42px] h-[42px] inline-flex items-center justify-center",
            buttonClasses
          )}
          onClick={() => setShowOptions(true)}
          data-tip="Create new game vs computer"
          aria-label="create new game versus computer"
        >
          <FontAwesomeIcon icon={faRobot} />
          {mode === "text" && <span className="ml-2">Play vs computer</span>}
          {mode === "shorttext" && <span className="ml-2">Computer</span>}
        </Button>
      </Popover>
    </>
  );
};

export default PlayButtons;
