import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { faRobot, faSkull, faSpinner, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { Popover } from "react-tiny-popover";

import { useAppDispatch } from "../../app/hooks";
import Button from "../../presentational/Button";
import { createNewAIGame, createNewGame } from "../gamelist/gamelistActions";

const DifficultyButton: React.FC<{
  difficultyNumber: number;
  difficultyName: React.ReactNode;
  onPlayAIClick: (difficulty: number) => () => void;
  autoFocus?: boolean;
}> = ({ difficultyName, difficultyNumber, onPlayAIClick, autoFocus }) => (
  <Button
    autoFocus={autoFocus}
    variant="dark"
    onClick={onPlayAIClick(difficultyNumber)}
    aria-label={`create ${difficultyName} difficulty game vs bot`}
    className='px-3 mt-0'
  >
    {difficultyName}
    <span className="opacity-75 text-sm ml-1">({difficultyNumber})</span>
  </Button>
);

interface PlayButtonsProps {
  mode: "text" | "icon" | "shorttext";
  buttonClasses?: string;
  buttonVariant?: "dark" | "light";
}

const PlayButtons: React.FC<PlayButtonsProps> = ({
  mode,
  buttonClasses,
  buttonVariant,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [showOptions, setShowOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<false | "bot" | "human">(
    false
  );

  const onPlayOnlineClick = useCallback(async () => {
    setIsSubmitting("human");
    try {
      const game = await dispatch(createNewGame());
      navigate(`/play/${game}`);
      setIsSubmitting(false);
    } catch (e) {
      setIsSubmitting(false);
      toast(e, {
        type: "error",
      });
    }
  }, [navigate, dispatch]);

  const onPlayAIClick = useCallback(
    (difficulty: number) => async () => {
      setIsSubmitting("bot");
      setShowOptions(false);
      try {
        const game = await dispatch(createNewAIGame(difficulty));
        navigate(`/play/${game}`);
        setIsSubmitting(false);
      } catch (e) {
        setIsSubmitting(false);
        toast(e, {
          type: "error",
        });
      }
    },
    [navigate, dispatch]
  );

  const popoverContent = (
    <div className="bg-primary rounded-xl p-2 shadow-lg text-center">
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
        <DifficultyButton
          autoFocus
          difficultyName={<><FontAwesomeIcon icon={faSkull} /> Impossible</>}
          difficultyNumber={10}
          onPlayAIClick={onPlayAIClick}
        />
      </div>
    </div>
  );
  return (
    <>
      <Button
        variant={buttonVariant}
        className={classNames(
          mode === "text" || mode === "shorttext"
            ? "relative"
            : "w-[42px] h-[42px] inline-flex items-center justify-center m-0",
          buttonClasses,
          isSubmitting && "bg-gray-500 text-white"
        )}
        disabled={Boolean(isSubmitting)}
        onClick={onPlayOnlineClick}
        data-tip="Create new game vs human"
      >
        <FontAwesomeIcon
          className={isSubmitting === "human" ? "animate-spin" : ""}
          icon={isSubmitting === "human" ? faSpinner : faUser}
        />
        {mode === "text" && <span className="ml-2">Play vs human</span>}
        {mode === "shorttext" && <span className="ml-2">Human</span>}
      </Button>

      <Popover
        isOpen={showOptions}
        containerClassName="z-40"
        onClickOutside={() => setShowOptions(false)}
        content={popoverContent}
      >
        <Button
          variant={buttonVariant}
          className={classNames(
            mode === "text" || mode === "shorttext"
              ? "relative"
              : "w-[42px] h-[42px] inline-flex items-center justify-center m-0",
            buttonClasses,
            isSubmitting && "bg-gray-500 text-white"
          )}
          disabled={Boolean(isSubmitting)}
          onClick={() => setShowOptions(true)}
          data-tip="Create new game vs computer"
          aria-label="create new game versus computer"
        >
          <FontAwesomeIcon
            className={isSubmitting === "bot" ? "animate-spin" : ""}
            icon={isSubmitting === "bot" ? faSpinner : faRobot}
          />
          {mode === "text" && <span className="ml-2">Play vs computer</span>}
          {mode === "shorttext" && <span className="ml-2">Computer</span>}
        </Button>
      </Popover>
    </>
  );
};

export default PlayButtons;
