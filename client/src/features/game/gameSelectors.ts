import { createSelector } from "@reduxjs/toolkit";
import * as R from "ramda";

import { RootState } from "../../app/store";
import { QRCoord } from "../hexGrid/hexGrid";

export const getOrderedTileSelectionCoords = createSelector(
  (state: RootState) => state.game.selectedTiles,
  (selectedTiles) => {
    const pairs = R.toPairs(selectedTiles);
    const sortedPairs = R.sortBy((pair) => pair[1], pairs);
    return sortedPairs.map((pair) => pair[0]);
  }
);

export const getGridByGameId = createSelector(
  (state: RootState) => state.gamelist.games,
  (_, gameId: string) => gameId,
  (games, gameId) => {
    return games[gameId].grid;
  }
);

export interface willTileTouchTerritoryParams {
  coord: QRCoord;
  gameId: string;
}

export const willTileTouchTerritory = createSelector(
  getOrderedTileSelectionCoords,
  (_, touchParams: willTileTouchTerritoryParams) => touchParams,
  () => {}
)

export const getSelectedWordByGameId = createSelector(
  getOrderedTileSelectionCoords,
  getGridByGameId,
  (tileCoordinates, grid) => {
    if (!grid) {
      return null;
    }
    const letters = tileCoordinates.map((coord) => grid[coord].value);
    return letters.join("").toUpperCase();
  }
);
