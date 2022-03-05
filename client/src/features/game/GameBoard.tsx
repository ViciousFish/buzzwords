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
import {
  faArrowCircleRight,
  faBackspace,
  faPaperPlane,
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
  const dispatch = useDispatch();

  const nickname = useAppSelector((state) => state.user.user?.nickname);
  const opponent: User | undefined = useAppSelector(
    (state) => state.user.opponents[game.users[1 - userIndex]]
  );

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
    if (id) {
      dispatch(onSubmit());
    }
  });
  const selfName = nickname ?? "You";
  const opponentName = game.vsAI ? "Computer" : opponent?.nickname ?? "Them";
  return (
    <div className="h-[80vh] lg:h-[calc(100vh-50px)] flex-auto overflow-hidden">
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
              <Html
                zIndexRange={[20, 0]}
                position={[0, game.turn === 0 ? 4.5 : 4, 0]}
                center
              >
                <span>{userIndex === 0 ? selfName : opponentName}</span>
              </Html>
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
              <Html
                zIndexRange={[20, 0]}
                position={[0, game.turn === 1 ? 4.5 : 4, 0]}
                center
              >
                {userIndex === 1 ? selfName : opponentName}
              </Html>
            </group>
          </group>
          <group position={[0, 13.5, 0]}>
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
                      "mx-1",
                      submitting ? "text-gray-500" : "text-darkbrown"
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
                      "mx-1",
                      submitting ? "text-gray-500" : "text-darkbrown"
                    )}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} size="2x" />
                  </button>
                ) : null}
                <div className="text-[calc(4vh+4vw)] text-darkbrown font-fredoka">
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
                      "font-bold text-lightbg bg-opacity-100 rounded-md p-1 mx-1",
                      submitting ? "bg-gray-500" : "bg-darkbrown"
                    )}
                  >
                    Submit
                  </button>
                ) : null}
              </div>
            </Html>
          </group>
          <group position={[0, -8, 0]}>
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
