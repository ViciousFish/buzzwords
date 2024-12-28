import Game, { Move } from "buzzwords-shared/Game";
import classNames from "classnames";
import React, { useMemo } from "react";
import { useAppSelector } from "../../app/hooks";
import Canvas from "../canvas/Canvas";
import { GameBoardTiles } from "../game/GameBoardTiles";
import { DictionaryEntry } from "./DictionaryEntry";

interface MoveDetailCardProps {
  move: Move;
  mobileLayout: boolean;
  index: number;
}

export function MoveDetailCard({ move, mobileLayout, index }: MoveDetailCardProps) {
  const word = useMemo(
    () => (move.forfeit ? "resign" : move.letters.join("")),
    [move.letters, move.forfeit]
  );
  return (
    <div
      className={classNames(
        "h-full w-full min-h-0 overflow-auto items-stretch",
        mobileLayout
          ? "grid grid-rows-[min(calc(90vw*1.2),75vh),min-content] grid-cols-1"
          : "grid grid-cols-[minmax(0,1fr),min-content] grid-rows-1"
      )}
    >
      <Canvas>
        <GameBoardTiles
          position={[0, 0, 0]}
          enableSelection={false}
          onToggleTile={null}
          grid={move.grid}
          revealLetters
          currentTurn={move.player}
          selection={move.coords}
        />
      </Canvas>
      <DictionaryEntry
        key={word}
        word={word}
        moveDate={move.date}
        isForfeit={move.forfeit}
        playerIndex={move.player}
        mobileLayout={mobileLayout}
        index={index}
      />
    </div>
  );
}
