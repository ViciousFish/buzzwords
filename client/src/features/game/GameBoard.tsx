import { Html, useProgress } from "@react-three/drei";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../presentational/Button";
import Canvas from "../canvas/Canvas";
import { QRCoord } from "../hexGrid/hexGrid";
import { Game } from "./game";
import { submitMove } from "./gameActions";
import { getSelectedWordByGameId } from "./gameSelectors";
import { resetGame } from "./gameSlice";
import GameTile from "./GameTile";

interface GameBoardProps {
  id: string;
  game: Game;
  userIndex: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ id, game, userIndex }) => {
  const { progress } = useProgress();
  const dispatch = useDispatch();

  const selectedWord = useSelector((state) =>
    getSelectedWordByGameId(state, id)
  );

  const [revealLetters, setRevealLetters] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setRevealLetters(true);
    }, 500);
  });
  return (
    <div className="flex flex-col h-full flex-auto">
      {/* <div className="flex justify-around">
        <div>you are {userIndex === 0 ? "pink" : "green"}</div>
        {game && !game.gameOver && (
          <div className="block">
            it is {game?.turn === 0 ? "pinks" : "greens"} turn
          </div>
        )}
        {game && game.gameOver && (
          <div>{game.winner === 0 ? "pink" : "green"} won</div>
        )}
      </div> */}

      <div className="flex-auto lg:w-[calc(100vw-500px)]">
        <Canvas key={`play-${id}`}>
          {/* <CameraControls /> */}
          <React.Suspense fallback={<Html center>{progress} % loaded</Html>}>
            {/* <HexWord allowSpinning autoSpin={false} position={[0, 20, 0]} text={selectedWord + ' '}/> */}
            <group position={[0, 22, 0]}>
              <group position={[-10, 0, 0]}>
                <GameTile
                  owner={0}
                  position={[0, 0, 0]}
                  isPlayerIdentity
                  currentGame={id}
                />
                <Html position={[4, -1.5, 0]} center>
                  <span>{userIndex === 0 ? "You" : "Them"}</span>
                </Html>
              </group>
              <group position={[10, 0, 0]}>
                <GameTile
                  owner={1}
                  letter=""
                  position={[0, 0, 0]}
                  isPlayerIdentity
                  currentGame={id}
                />
                <Html position={[4, -1.5, 0]} center>
                  {userIndex === 1 ? "You" : "Them"}
                </Html>
              </group>
            </group>
            <group position={[0, 16, 0]}>
              <Html center>
                <div
                  className="flex justify-center items-center"
                  // style={{ height: "100px" }}
                >
                  {selectedWord?.length ? (
                    <Button
                      onClick={() => {
                        dispatch(resetGame());
                      }}
                      type="button"
                    >
                      clear
                    </Button>
                  ) : null}
                  <span className="text-7xl text-darkbrown font-fredoka">
                    {selectedWord || ""}
                  </span>
                  {selectedWord?.length ? (
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
            <group position={[0, -6, 0]}>
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
    </div>
  );
};

export default GameBoard;
