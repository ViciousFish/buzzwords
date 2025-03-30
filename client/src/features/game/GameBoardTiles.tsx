import React, { useMemo } from "react";
import { GroupProps } from "@react-three/fiber";
import * as R from "ramda";

import Cell from "buzzwords-shared/cell";
import HexGrid from "buzzwords-shared/hexgrid";
import { HexCoord } from "buzzwords-shared/types";
import {
  getCellsToBeReset,
  willConnectToTerritory,
} from "buzzwords-shared/gridHelpers";

import { QRCoord } from "../hexGrid/hexGrid";
import GameTile from "./GameTile";

const STARTING_TILES = [
  { q: -3, r: 0 },
  { q: -2, r: 0 },
  { q: -2, r: -2 },
  { q: -1, r: -1 },
  { q: -3, r: -1 },
  { q: -1, r: -2 },
  { q: -2, r: -1 },
];

export function GameBoardTiles({
  grid,
  revealLetters,
  position,
  selection,
  currentTurn,
  enableSelection,
  onToggleTile,
  tutorialOnlyShowStartingTiles = false,
}: {
  grid: HexGrid;
  revealLetters: boolean;
  selection: HexCoord[];
  currentTurn: 0 | 1;
  enableSelection: boolean;
  onToggleTile: (coord: QRCoord) => void;
  tutorialOnlyShowStartingTiles?: boolean;
} & Pick<GroupProps, "position">) {
  const tilesThatWillBeCaptured = useMemo(() => {
    const willBeCaptured = {};
    selection.forEach((coord) => {
      willBeCaptured[`${coord.q},${coord.r}`] = willConnectToTerritory(
        grid,
        selection,
        coord,
        currentTurn
      );
    });
    return willBeCaptured;
  }, [grid, selection, currentTurn]);

  const tilesThatWillBeReset = useMemo(() => {
    const cells = getCellsToBeReset(grid, selection, currentTurn);
    return R.groupBy((cell: Cell) => `${cell.q},${cell.r}`, cells);
  }, [grid, selection, currentTurn]);
  return (
    <group position={position}>
      {Object.entries(grid).map(([coord, tile]) => {
        const [q, r] = coord.split(",").map(Number);
        const hidden =
          tutorialOnlyShowStartingTiles &&
          !STARTING_TILES.some(
            (startingTile) => startingTile.q === q && startingTile.r === r
          );
        return (
          <GameTile
            hidden={hidden}
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
            selected={Boolean(
              selection.find((hexcoord) => hexcoord.q === q && hexcoord.r === r)
            )}
            currentTurn={currentTurn}
            enableSelection={enableSelection}
            willBeReset={Boolean(tilesThatWillBeReset[coord])}
            willBeCaptured={tilesThatWillBeCaptured[coord]}
            onSelect={() => {
              onToggleTile(coord as QRCoord);
            }}
          />
        );
      })}
    </group>
  );
}
