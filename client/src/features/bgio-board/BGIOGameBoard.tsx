import React from "react";
import { BoardProps } from "boardgame.io/react";
import { BuzzwordsGameState } from "buzzwords-shared/Buzzwords";
import Canvas from "../canvas/Canvas";
import { GameBoardTiles } from "../game/GameBoardTiles";
import { BGIOStatusArea } from "./BGIOStatusArea";
import { useBotPlayer } from "./useBotPlayer";

export function BGIOGameBoard(props: BoardProps<BuzzwordsGameState>) {
  useBotPlayer(props);

  return (
    <div className="flex flex-col flex-auto">
      <BGIOStatusArea
        selection={props.G.selection}
        setSelection={(selection) => props.moves.updateSelection(selection)}
        {...props}
      />
      <div className="flex-auto relative px-4">
        <Canvas isGameboard>
          <GameBoardTiles
            tutorialOnlyShowStartingTiles={props.ctx.turn === 1}
            revealLetters
            enableSelection={props.ctx.currentPlayer === "0" && !props.ctx.gameover}
            onToggleTile={(coord) => {
              const [q, r] = coord.split(",").map(Number);
              const index = props.G.selection.findIndex(
                (x) => x.q === q && x.r === r
              );
              const newSelection = [...props.G.selection];
              if (index > -1) {
                newSelection.splice(index, 1);
              } else {
                newSelection.push({ q, r });
              }
              props.moves.updateSelection(newSelection);
            }}
            grid={props.G.grid}
            selection={props.G.selection}
            currentTurn={Number(props.ctx.currentPlayer) as 0 | 1}
          />
        </Canvas>
      </div>
    </div>
  );
}
