import React, { useEffect, useState } from "react";
import { Html, useProgress } from "@react-three/drei";
import { Link, useParams } from "react-router-dom";

import Canvas from "../canvas/Canvas";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import GameTile from "../game/GameTile";
import { QRCoord } from "../hexGrid/hexGrid";
import { resetGame } from "../game/gameSlice";

const Play: React.FC = () => {
  const dispatch = useDispatch();
  const { progress } = useProgress();
  const { id } = useParams();
  const game = useSelector((state: RootState) => state.gamelist.games[id]);
  const currentUser = useSelector((state: RootState) => state.user.user);
  const [revealLetters, setRevealLetters] = useState(false);

  const userIndex = game && currentUser ? game.users.findIndex((val) => val === currentUser.id) : null;

  useEffect(() => {
    dispatch(resetGame());
    setTimeout(() => {
      setRevealLetters(true);
    }, 500)
  }, [])
  return game ? (
    <>
      <div className="flex justify-around">
        <Link className="btn" to="/">
          home
        </Link>
        <button type="button" onClick={() => setRevealLetters(!revealLetters)}>toggle letters</button>
        <div>you are {userIndex === 0 ? 'pink' : 'green'}</div>
        <div className="block">it is {game.turn === 0 ? 'pinks' : 'greens'} turn</div>
      </div>
      <div className="flex-auto lg:w-[calc(100vw-300px)]">
        <Canvas key={`play-${id}`}>
          <React.Suspense fallback={<Html center>{progress} % loaded</Html>}>
            <group position={[0, 0, 0]}>
              {Object.keys(game.grid).map((coord: QRCoord) => {
                const gridTile = game.grid[coord];
                return (
                  <GameTile
                    coord={coord}
                    letter={revealLetters ? gridTile.value.toUpperCase() : null}
                    position={[
                      3.1 * (3 / 2) * gridTile.q,
                      -1 * 3.1 *
                        (Math.sqrt(3) / 2 * gridTile.q +
                          Math.sqrt(3) * gridTile.r),
                      0,
                    ]}
                    key={coord}
                    owner={gridTile.owner}
                    currentGame={id}
                  />
                );
              })}
            </group>
          </React.Suspense>
        </Canvas>
      </div>
    </>
  ) : null;
};

export default Play;
