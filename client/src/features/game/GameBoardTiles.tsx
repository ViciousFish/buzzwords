import { GroupProps } from "@react-three/fiber";
import Cell from "buzzwords-shared/cell";
import HexGrid from "buzzwords-shared/hexgrid";
import { HexCoord } from "buzzwords-shared/types";
import React from "react";
import { QRCoord } from "../hexGrid/hexGrid";
import GameTile from "./GameTile";

export function GameBoardTiles({
  grid,
  revealLetters,
  position,
  selection,
  currentTurn,
  enableSelection,
  tilesThatWillBeReset,
  tilesThatWillBeCaptured,
  onToggleTile,
}: {
  grid: HexGrid;
  revealLetters: boolean;
  selection: string[];
  currentTurn: 0 | 1;
  enableSelection: boolean;
  tilesThatWillBeReset: Record<string, Cell[]>;
  tilesThatWillBeCaptured: Record<string, boolean>;
  onToggleTile: (coord: QRCoord) => void;
} & Pick<GroupProps, "position">) {
  return (
    <group position={position}>
      {Object.entries(grid).map(([coord, tile]) => {
        return (
          <GameTile
            isCapital={revealLetters ? tile.capital : false}
            coord={coord as QRCoord}
            letter={revealLetters ? tile.value : ""}
            position={[
              // https://www.redblobgames.com/grids/hexagons/#hex-to-pixel-axial
              3.1 * (3 / 2) * tile.q,
              -1 * 3.1 * ((Math.sqrt(3) / 2) * tile.q + Math.sqrt(3) * tile.r),
              0,
            ]}
            key={coord}
            owner={tile.owner}
            selected={selection.includes(coord)}
            currentTurn={currentTurn}
            enableSelection={enableSelection}
            willBeReset={Boolean(tilesThatWillBeReset[coord])}
            willBeCaptured={tilesThatWillBeCaptured[coord]}
            onSelect={() => {
              console.log('toggle', coord);
              onToggleTile(coord as QRCoord)
            }}
          />
        );
      })}
    </group>
  );
}
