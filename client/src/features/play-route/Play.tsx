import React from "react";
import { Html, useProgress } from "@react-three/drei";
import { Link, useParams } from "react-router-dom";

import Canvas from "../../Canvas";
import { Bee } from "../../Components/three/Bee";
import HexWord from "../../Components/three/HexWord";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import GameTile from "../game/GameTile";
import { Cell } from "../cell/cell";
import { QRCoord } from "../hexGrid/hexGrid";

const Play: React.FC = () => {
  const { progress } = useProgress();
  const { id } = useParams();
  const game = useSelector((state: RootState) => state.gamelist.games[id]);
  const currentUser = useSelector((state: RootState) => state.user.user);
  console.log('currentUser :', currentUser);
  const userIndex = game && currentUser ? game.users.findIndex((val) => val === currentUser.id) : null;
  console.log("userIndex", userIndex);
  return game ? (
    <>
      <div>
        <Link className="btn" to="/">
          home
        </Link>
        <span>you are {userIndex === 0 ? 'pink' : 'green'}</span>
      </div>
      <div className="flex-auto lg:w-[calc(100vw-300px)]">
        <Canvas key={`play-${id}`}>
          <React.Suspense fallback={<Html center>{progress} % loaded</Html>}>
            <group position={[0, 0, 0]}>
              {Object.keys(game.grid).map((coord: QRCoord) => {
                const gridTile = game.grid[coord];
                return (
                  <GameTile
                    cell={gridTile}
                    letter={gridTile.value.toUpperCase()}
                    position={[
                      3.1 * (3 / 2) * gridTile.q,
                      -1 * 3.1 *
                        (Math.sqrt(3) / 2 * gridTile.q +
                          Math.sqrt(3) * gridTile.r),
                      0,
                    ]}
                    key={coord}
                    color={gridTile.owner == 2 ? 'primary' : (`p${gridTile.owner + 1}` as 'p1' | 'p2')}
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
