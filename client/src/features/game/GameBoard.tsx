import { Html, useProgress } from "@react-three/drei";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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

  const selectedWord = useSelector((state) => getSelectedWordByGameId(state, id));
  
  const [revealLetters, setRevealLetters] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setRevealLetters(true);
    }, 500);
  });
  return (
    <div className="flex flex-col h-full flex-auto">
      <div
        className="flex justify-center items-center"
        style={{ height: "100px" }}
      >
        {selectedWord?.length ? (
          <button
            onClick={() => {
              dispatch(resetGame());
            }}
            type="button"
          >
            clear
          </button>
        ) : null}
        <span className="text-7xl text-darkbrown font-fredoka">
          {selectedWord || ""}
        </span>
        {selectedWord?.length ? (
          <button onClick={() => dispatch(submitMove(id))} type="button">
            submit
          </button>
        ) : null}
      </div>
      <div className="flex-auto lg:w-[calc(100vw-400px)]">
        <Canvas key={`play-${id}`}>
          {/* <CameraControls /> */}
          <React.Suspense fallback={<Html center>{progress} % loaded</Html>}>
            {/* <HexWord allowSpinning autoSpin={false} position={[0, 20, 0]} text={selectedWord + ' '}/> */}
            <group position={[0, 0, 0]}>
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
