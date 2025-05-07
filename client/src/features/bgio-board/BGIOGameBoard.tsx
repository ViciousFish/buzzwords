import React, { useEffect } from "react";
import { BoardProps } from "boardgame.io/react";
import { BuzzwordsGameState } from "buzzwords-shared/Buzzwords";
import { HexCoord } from "buzzwords-shared/types";
import Canvas from "../canvas/Canvas";
import { GameBoardTiles } from "../game/GameBoardTiles";
import { BGIOStatusArea } from "./BGIOStatusArea";
import { TutorialBuzzwords } from "buzzwords-shared/Tutorial";

export function BGIOGameBoard(props: BoardProps<BuzzwordsGameState>) {
  // Handle AI moves
  useEffect(() => {
    if (props.ctx.currentPlayer === "1" && !props.ctx.gameover) {
      const timer = setTimeout(() => {
        try {
          const moves = TutorialBuzzwords.ai?.enumerate(props.G, props.ctx, "1");
          if (moves && moves.length > 0) {
            const botMove = moves[0];
            if (botMove && 'move' in botMove && botMove.args && botMove.args[0]) {
              // Delay the actual move by 2 seconds
              setTimeout(() => {
                props.moves.playWord(botMove.args?.[0]);
              }, 2000);
            } else if (botMove && 'move' in botMove && botMove.move === 'pass') {
              setTimeout(() => {
                props.moves.pass();
              }, 2000);
            }
          }
        } catch (e) {
          console.error("AI failed to make a move:", e);
          setTimeout(() => {
            props.moves.pass();
          }, 2000);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [props.ctx.currentPlayer, props.ctx.gameover, props.G, props.ctx, props.moves]);

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
            enableSelection
            onToggleTile={(coord) => {
              const [q, r] = coord.split(",").map(Number);
              const index = props.G.selection.findIndex((x) => x.q === q && x.r === r);
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
