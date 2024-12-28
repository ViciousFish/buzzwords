import Game, { Move } from "buzzwords-shared/Game";
import React, { useMemo } from "react";
import { useAppSelector } from "../../app/hooks";
import Canvas from "../canvas/Canvas";
import { GameBoardTiles } from "../game/GameBoardTiles";
import { DictionaryEntry } from "./DictionaryEntry";

interface MoveDetailCardProps {
  move: Move;
  game: Game;
}

export function MoveDetailCard({ move, game }: MoveDetailCardProps) {
  const word = useMemo(() => move.letters.join(''), [move.letters]);
  return (
    <div className="h-full overflow-hidden grid grid-rows-[min-content,minmax(0,auto)]">
      <DictionaryEntry key={word} word={word} moveDate={move.date} />
      <Canvas>
        <GameBoardTiles
        position={[0,0,0]}
          enableSelection={false}
          onToggleTile={null}
          grid={move.grid}
          revealLetters
          currentTurn={move.player}
          selection={move.coords}
        />
      </Canvas>
    </div>
  );
}
