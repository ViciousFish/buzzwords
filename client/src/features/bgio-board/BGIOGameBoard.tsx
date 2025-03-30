import React, { useState } from "react";
import { BoardProps } from "boardgame.io/react";
import { BuzzwordsGameState } from "buzzwords-shared/Buzzwords";
import { HexCoord } from "buzzwords-shared/types";
import Canvas from "../canvas/Canvas";
import { GameBoardTiles } from "../game/GameBoardTiles";
import { Button } from "react-aria-components";
export function BGIOGameBoard({
  G,
  ctx,
  moves,
}: BoardProps<BuzzwordsGameState>) {
  const [selection, setSelection] = useState<HexCoord[]>([]);
  const word = selection.map(({ q, r }) => G.grid[`${q},${r}`].value);
  return (
    <div className="flex flex-col flex-auto">
      <div className="text-[2vh] mx-auto max-w-[600px] h-[20vh] flex flex-col justify-center items-center p-4 lg:p-8 w-full">
        {word.length > 0 ? (
          <div className="flex gap-2 p-4 justify-center items-center">
            <Button
              className="bg-darkbrown text-lightbg rounded-full px-2 py-1 text-[1vh]"
              onPress={() => {
                setSelection([]);
              }}
            >
              Delete
            </Button>
            <h1 className="text-[4vh] font-fredoka text-darkbrown uppercase">
              {word}
            </h1>
            <Button
              className="bg-darkbrown text-lightbg rounded-full px-2 py-1 text-[1vh]"
              onPress={() => {
                moves.playWord(selection);
                setSelection([]);
              }}
            >
              Submit
            </Button>
          </div>
        ) : (
          <div className="">
            <h1 className="font-bold">
              Welcome to{" "}
              <img
              className="inline drop-shadow mb-1 ml-1 relative bottom-1"
              style={{ width: 30, height: 30 }}
              src="/bee.png"
            />{" "}
              <span className="text-darkbrown font-fredoka uppercase">
                Buzzwords
              </span>
              .
            </h1>
            <p className="text-[1.5vh]">It&apos;s your turn. Select a word.</p>
          </div>
        )}
      </div>
      <div className="flex-auto relative px-4">
        <Canvas isGameboard>
          <GameBoardTiles
            revealLetters
          enableSelection
          onToggleTile={(coord) => {
            const [q, r] = coord.split(",").map(Number);
            const index = selection.findIndex((x) => x.q === q && x.r === r);
            if (index > -1) {
              selection.splice(index, 1);
              setSelection([...selection]);
              return;
            }
            setSelection([...selection, { q, r }]);
          }}
          grid={G.grid}
          selection={selection}
            currentTurn={Number(ctx.currentPlayer) as 0 | 1}
          />
        </Canvas>
      </div>
    </div>
  );
}
