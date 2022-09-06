import Cell from "buzzwords-shared/cell";
import React from "react";

import Step0Video from "../../assets/0-hello-square.mp4?url";
import Canvas from "../canvas/Canvas";
import GameTile from "../game/GameTile";

const TUTORIAL_0_TILES: Cell[] = [
  { q: 0, r: 0, capital: true, owner: 0, value: "" },
  { q: -1, r: 1, capital: false, owner: 2, value: "h" },
  { q: 0, r: 1, capital: false, owner: 2, value: "e" },
  { q: 1, r: 0, capital: false, owner: 2, value: "l" },
  { q: 1, r: -1, capital: false, owner: 2, value: "l" },
  { q: 0, r: -1, capital: false, owner: 2, value: "o" },
  { q: -1, r: 0, capital: false, owner: 2, value: "i" },
];

const TutorialPage = () => {
  return (
    <div className="bg-[#F6E5AE]">
      <h2 className="font-bold text-2xl">Welcome to Buzzwords!</h2>
      <p>How to play:</p>
      <div className="my-2">
        <h3 className="text-xl">1. Make words</h3>
        {/* <video className="w-full" src={Step0Video} playsInline autoPlay muted /> */}
        <div style={{ height: 200 }}>
          <Canvas>
            {TUTORIAL_0_TILES.map((tile) => {
              const coord = `${tile.q},${tile.r}`;
              return (
                <GameTile
                  key={coord}
                  letter={tile.value}
                  position={[
                    // https://www.redblobgames.com/grids/hexagons/#hex-to-pixel-axial
                    3.1 * (3 / 2) * tile.q,
                    -1 *
                      3.1 *
                      ((Math.sqrt(3) / 2) * tile.q + Math.sqrt(3) * tile.r),
                    0,
                  ]}
                  isCapital={tile.capital}
                  owner={tile.owner}
                  currentGame={null}
                />
              );
            })}
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;
