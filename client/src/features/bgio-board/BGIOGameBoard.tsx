import React, { useState } from "react";
import { BoardProps } from "boardgame.io/react";
import { BuzzwordsGameState } from "buzzwords-shared/Buzzwords";
import { HexCoord } from "buzzwords-shared/types";
import Canvas from "../canvas/Canvas";
import { GameBoardTiles } from "../game/GameBoardTiles";
import { BGIOStatusArea } from "./BGIOStatusArea";

export function BGIOGameBoard(props: BoardProps<BuzzwordsGameState>) {
  const [selection, setSelection] = useState<HexCoord[]>([]);
  return (
    <div className="flex flex-col flex-auto">
      <BGIOStatusArea
        selection={selection}
        setSelection={setSelection}
        {...props}
      />
      <div className="flex-auto relative px-4">
        <Canvas isGameboard>
          <GameBoardTiles
            tutorialOnlyShowStartingTiles={props.ctx.turn === 1}
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
            grid={props.G.grid}
            selection={selection}
            currentTurn={Number(props.ctx.currentPlayer) as 0 | 1}
          />
        </Canvas>
      </div>
    </div>
  );
}
