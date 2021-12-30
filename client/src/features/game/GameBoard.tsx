import { Html, useProgress } from "@react-three/drei";
import Game from "buzzwords-shared/Game";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
import Canvas from "../canvas/Canvas";
import { QRCoord } from "../hexGrid/hexGrid";
import { clearTileSelection, submitMove } from "./gameActions";
import { getSelectedWordByGameId } from "./gameSelectors";
import GameTile from "./GameTile";

interface GameBoardProps {
  id: string;
  game: Game;
  userIndex: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ id, game, userIndex }) => {
  const { progress } = useProgress();
  const dispatch = useDispatch();

  const selectedWord = useAppSelector((state) =>
    getSelectedWordByGameId(state, id)
  );

  const [revealLetters, setRevealLetters] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setRevealLetters(true);
    }, 500);
  });
  return (
    <div className="h-[80vh] lg:h-screen flex-auto overflow-hidden">
      <Canvas key={`play-${id}`}>
        {/* <CameraControls /> */}
        <React.Suspense fallback={<Html center>{progress.toFixed(0)} % loaded</Html>}>
          {/* <HexWord allowSpinning autoSpin={false} position={[0, 20, 0]} text={selectedWord + ' '}/> */}
          <group position={[0, 21, 0]}>
            <group position={[-10, 0, 0]}>
              <GameTile
                owner={0}
                position={[0, 0, 0]}
                isPlayerIdentity
                currentGame={id}
              />
              <Html position={[0, game.turn === 0 ? 5 : 4, 0]} center>
                <span>{userIndex === 0 ? "You" : "Them"}</span>
              </Html>
            </group>
            {/* <Html center>
              <div className="flex items-center justify-center">
                {game.turn === 0 && <FontAwesomeIcon className="mr-2" size='lg' icon={faArrowLeft} />}
                <span className="text-2xl font-bold">TURN</span>
                {game.turn === 1 && <FontAwesomeIcon className="ml-2" size='lg' icon={faArrowRight} />}
              </div>
            </Html> */}
            <group position={[10, 0, 0]}>
              <GameTile
                owner={1}
                letter=""
                position={[0, 0, 0]}
                isPlayerIdentity
                currentGame={id}
              />
              <Html position={[0, game.turn === 1 ? 5 : 4, 0]} center>
                {userIndex === 1 ? "You" : "Them"}
              </Html>
            </group>
          </group>
          <group position={[0, 13.5, 0]}>
            <Html center>
              <div className="flex justify-center items-center">
                {selectedWord?.length && game.turn === userIndex ? (
                  <Button
                    onClick={() => {
                      dispatch(clearTileSelection());
                    }}
                    type="button"
                  >
                    clear
                  </Button>
                ) : null}
                <div className="text-[calc(4vh+4vw)] text-darkbrown font-fredoka">
                  {selectedWord || ""}
                </div>
                {selectedWord?.length && game.turn === userIndex ? (
                  <Button
                    onClick={() => dispatch(submitMove(id))}
                    type="button"
                  >
                    submit
                  </Button>
                ) : null}
              </div>
            </Html>
          </group>
          <group position={[0, -8, 0]}>
            {Object.keys(game.grid).map((coord: QRCoord) => {
              const gridTile = game.grid[coord];
              return (
                <GameTile
                  isCapital={revealLetters ? gridTile.capital : false}
                  coord={coord}
                  letter={revealLetters ? gridTile.value.toUpperCase() : ""}
                  position={[
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
