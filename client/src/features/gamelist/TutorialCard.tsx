import { faFilm, faTimes, faVideo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";
import { useAppDispatch } from "../../app/hooks";
import { toggleTutorialModal } from "../game/gameSlice";
import { setShowTutorialCard } from "./gamelistSlice";

const TutorialCard: React.FC<{
  hideDismiss?: boolean;
  shadow?: boolean;
}> = ({
  hideDismiss,
  shadow
}) => {
  const dispatch = useAppDispatch();
  return (
    <div className={classNames("rounded-xl bg-primary p-4 mx-2 text-text", shadow && 'shadow-xl border border-darkbrown')}>
      <h3 className="text-lg font-bold inline">How to play</h3>
      {!hideDismiss && <div className="float-right text-lg">
        <button
          className="hover:text-darkbrown mr-2"
          data-tip="Watch tutorial"
          aria-label="watch tutorial"
          onClick={() => dispatch(toggleTutorialModal())}
        >
          <FontAwesomeIcon icon={faFilm} />
        </button>
        <button
          className="hover:text-darkbrown"
          data-tip="Dismiss instructions"
          aria-label="dismiss instructions"
          onClick={() => dispatch(setShowTutorialCard(false))}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>}
      <ul className="list-disc list-outside pl-6 text-sm">
        <li>
          <h4 className="font-bold">Make words</h4>
          <p>Use any letter on the board</p>
        </li>
        <li>
          <h4 className="font-bold">Capture tiles</h4>
          <p>
            You&apos;ll capture any letters you play that touch your territory,
            or form a chain back to your territory. Letters will turn your color
            instead of grey when you select them if they will be captured!
          </p>
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
