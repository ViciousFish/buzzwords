import { faFilm, faTimes, faVideo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";
import { useAppDispatch } from "../../app/hooks";
import { toggleTutorialModal } from "../game/gameSlice";
import { dismissTutorialCard } from "./gamelistActions";
import { setShowTutorialCard } from "./gamelistSlice";

const TutorialCard: React.FC<{
  hideDismiss?: boolean;
  shadow?: boolean;
}> = ({ hideDismiss, shadow }) => {
  const dispatch = useAppDispatch();
  return (
    <div
      className={classNames(
        "rounded-xl bg-primary mx-2 mb-4",
        "bg-bYellow-500 dark:bg-beeYellow-800 text-beeYellow-900 dark:text-beeYellow-200",
        shadow ?
          "shadow-xl border-2 border-bBrown-900 dark:border-beeYellow-700" : "dark:bg-beeYellow-900"
      )}
    >
      <div className="flex items-center justify-between bg-bBrown-900 text-bYellow-300 pl-2 py-1">
        <h3 className="text-lg font-bold inline">Tutorial</h3>
        {!hideDismiss && (<div>
          <button
            className="hover:text-darkbrown mr-2"
            data-tip="Watch tutorial"
            aria-label="watch tutorial"
            onClick={() => dispatch(toggleTutorialModal())}
          >
            <FontAwesomeIcon icon={faFilm} />
          </button>
          <button
            className="hover:text-darkbrown p-1 mr-2"
            data-tip="Dismiss instructions"
            aria-label="dismiss instructions"
            onClick={() => dispatch(setShowTutorialCard(false))}
          >
            <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}
      </div>
      <ul className="list-disc list-outside px-6 py-3 text-sm">
        <li>
          <h4 className="font-bold">Spell words</h4>
          <p>Tap any letter tile on the board</p>
        </li>
        <li>
          <h4 className="font-bold">Capture tiles</h4>
          <p>You&apos;ll capture chains of letters that touch your territory</p>
        </li>
        <li>
          <h4 className="font-bold">Go for the flower</h4>
          <p>
            You get an extra turn if you destroy your opponent&apos;s flower
            tile.
          </p>
        </li>
        <li>
          <h4 className="font-bold">Wipe out your opponent to win</h4>
          <p>Good luck!</p>
        </li>
      </ul>
    </div>
  );
};

export default TutorialCard;
