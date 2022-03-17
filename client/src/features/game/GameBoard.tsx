import { Html, useProgress } from "@react-three/drei";
import * as R from "ramda";
import Game from "buzzwords-shared/Game";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
import Canvas from "../canvas/Canvas";
import { QRCoord } from "../hexGrid/hexGrid";
import { User } from "../user/userSlice";
import {
  backspaceTileSelection,
  clearTileSelection,
  submitMove,
} from "./gameActions";
import { getSelectedWordByGameId } from "./gameSelectors";
import GameTile from "./GameTile";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackspace, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import useHotkeys from "@reecelucas/react-use-hotkeys";
import { getAllUsers } from "../user/userSelectors";

interface GameBoardProps {
  id: string;
  game: Game;
  userIndex: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ id, game, userIndex }) => {
  const { progress } = useProgress();
  const dispatch = useDispatch();

  const users = useAppSelector(getAllUsers);
  const p1Nick = users[game.users[0]]?.nickname;
  const p2Nick = game.vsAI ? "Computer" : users[game.users[1]]?.nickname;

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
    if (id && game.turn === userIndex) {
      dispatch(onSubmit());
    }
  });

  return (
    <div className="h-[80vh] lg:h-[calc(100vh-100px)] flex-auto overflow-hidden">
      <Canvas key={`play-${id}`}>
        {/* <CameraControls /> */}
        <React.Suspense
          fallback={<Html center>{progress.toFixed(0)} % loaded</Html>}
        >
          <group position={[0, 21, 0]}>
            <group position={[-10, 0, 0]}>
              <GameTile
                owner={0}
                position={[0, 0, 0]}
                isPlayerIdentity
                currentGame={id}
                gameOver={game.gameOver}
              />
              {/* Modals have z index of 30 */}
            </group>
            <group position={[10, 0, 0]}>
              <GameTile
                owner={1}
                letter=""
                position={[0, 0, 0]}
                isPlayerIdentity
                currentGame={id}
                gameOver={game.gameOver}
              />
            </group>
          </group>
          <group position={[0, 15, 0]}>
            <Html center zIndexRange={[20, 0]}>
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
                <div className="text-[calc(3.5vh+3.5vw)] text-darkbrown font-fredoka">
                  {replayLetters
                    ? R.take(replayProgress, replayLetters)
                        .join("")
                        .toUpperCase()
                    : selectedWord ?? ""}
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
          <group position={[0, -6, 0]}>
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
                  gameOver={game.gameOver}
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
