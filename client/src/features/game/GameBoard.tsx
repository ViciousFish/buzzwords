import { Html, useProgress } from "@react-three/drei";
import * as R from "ramda";
import Game from "buzzwords-shared/Game";
import React, { useCallback, useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Canvas from "../canvas/Canvas";
import { QRCoord } from "../hexGrid/hexGrid";
import {
  backspaceTileSelection,
  clearTileSelection,
  submitMove,
} from "./gameActions";
import { getSelectedWordByGameId } from "./gameSelectors";
import GameTile from "./GameTile";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBackspace,
  faSpinner,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import useHotkeys from "@reecelucas/react-use-hotkeys";

interface GameBoardProps {
  id: string;
  game: Game;
  userIndex: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ id, game, userIndex }) => {
  const { progress } = useProgress();
  const dispatch = useAppDispatch();

  const selectedWord = useAppSelector((state) =>
    getSelectedWordByGameId(state, id)
  );
  const replayLetters = useAppSelector(
    (state) => state.game.replay.move?.letters
  );
  const replayProgress = useAppSelector(
    (state) => state.game.replay.playbackState
  );

  const [revealLetters, setRevealLetters] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = useCallback(async () => {
    try {
      setSubmitting(true);
      await dispatch(submitMove(id));
      setSubmitting(false);
    } catch (e) {
      setSubmitting(false);
      toast(e, {
        type: "error",
      });
    }
  }, [dispatch, id]);

  useEffect(() => {
    setTimeout(() => {
      setRevealLetters(true);
    }, 500);
  });

  useHotkeys("Enter", () => {
    if (id && selectedWord?.length && game.turn === userIndex) {
      onSubmit();
    }
  });

  return (
    <div className="flex-auto flex-shrink-0 md:flex-shrink overflow-hidden h-[140vw] max-w-full max-h-[calc(100vh-120px)]">
      <Canvas isGameboard key={`play-${id}`}>
        {/* <CameraControls /> */}
        <React.Suspense
          fallback={
            <Html center>
              <FontAwesomeIcon
                icon={faSpinner}
                size="2x"
                className="m-4 animate-spin"
              />
            </Html>
          }
        >
          <group position={[0, 20, 0]}>
            <group position={[-10, 0, 0]}>
              <GameTile
                owner={0}
                position={[0, 0, 0]}
                isPlayerIdentity
                currentGame={id}
              />
            </group>
            <group position={[10, 0, 0]}>
              <GameTile
                owner={1}
                letter=""
                position={[0, 0, 0]}
                isPlayerIdentity
                currentGame={id}
              />
            </group>
          </group>
          <group position={[0, 14, 0]}>
            <Html center zIndexRange={[20, 0]} distanceFactor={0.075}>
              <div className="flex justify-center items-center">
                {selectedWord?.length && game.turn === userIndex ? (
                  <button
                    onClick={() => {
                      dispatch(backspaceTileSelection());
                    }}
                    disabled={submitting}
                    type="button"
                    className={classNames(
                      "mx-1 text-sm",
                      submitting ? "text-gray-400" : "text-darkbrown"
                    )}
                  >
                    <FontAwesomeIcon icon={faBackspace} size="2x" />
                  </button>
                ) : null}
                {selectedWord?.length && game.turn === userIndex ? (
                  <button
                    onClick={() => {
                      dispatch(clearTileSelection());
                    }}
                    disabled={submitting}
                    type="button"
                    className={classNames(
                      "mx-1 text-sm",
                      submitting ? "text-gray-400" : "text-darkbrown"
                    )}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} size="2x" />
                  </button>
                ) : null}
                <div
                  style={{ height: "60px" }}
                  className="text-[60px] text-darkbrown font-fredoka overflow-hidden"
                >
                  <span style={{ position: "relative", top: -15 }}>
                    {replayLetters
                      ? R.take(replayProgress, replayLetters)
                          .join("")
                          .toUpperCase()
                      : selectedWord ?? ""}
                  </span>
                </div>
                {selectedWord?.length && game.turn === userIndex ? (
                  <button
                    // variant='quiet'
                    onClick={onSubmit}
                    disabled={submitting}
                    type="button"
                    className={classNames(
                      "font-bold text-lightbg bg-opacity-100 rounded-md p-1 mx-1 text-sm",
                      submitting ? "bg-gray-400" : "bg-darkbrown"
                    )}
                  >
                    Submit
                  </button>
                ) : null}
              </div>
            </Html>
          </group>
          <group position={[0, -7, 0]}>
            {Object.keys(game.grid).map((coord: QRCoord) => {
              const gridTile = game.grid[coord];
              return (
                <GameTile
                  isSubmitting={submitting}
                  isCapital={revealLetters ? gridTile.capital : false}
                  coord={coord}
                  letter={revealLetters ? gridTile.value : ""}
                  position={[
                    // https://www.redblobgames.com/grids/hexagons/#hex-to-pixel-axial
                    3.1 * (3 / 2) * gridTile.q,
                    -1 *
                      3.1 *
                      ((Math.sqrt(3) / 2) * gridTile.q +
                        Math.sqrt(3) * gridTile.r),
                    0,
                  ]}
                  key={coord}
                  owner={gridTile.owner}
                  currentGame={id}
                  userIndex={userIndex}
                />
              );
            })}
          </group>
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default GameBoard;
