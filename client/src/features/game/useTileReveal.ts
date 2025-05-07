import { useEffect, useState, useRef, useCallback } from "react";
import { HexCoord } from "buzzwords-shared/types";
import HexGrid from "buzzwords-shared/hexgrid";

// Game board constants
const CAPITALS = {
  PLAYER_0: { q: -2, r: -1 },
  PLAYER_1: { q: 2, r: 1 },
} as const;

// Helper functions
/**
 * Calculates the distance between two hex coordinates in axial coordinates (q,r).
 * In axial coordinates, moving one step in any direction changes two coordinates.
 * The distance is calculated by:
 * 1. Converting axial coordinates to cube coordinates (q,r,s) where q + r + s = 0
 * 2. Taking the maximum of the absolute differences between each coordinate
 * 
 * For example:
 * - Distance between (0,0) and (1,0) is 1
 * - Distance between (0,0) and (1,1) is 1
 * - Distance between (0,0) and (2,0) is 2
 */
function calculateDistance(coord1: HexCoord, coord2: HexCoord): number {
  return (
    (Math.abs(coord1.q - coord2.q) +
      Math.abs(coord1.q + coord1.r - coord2.q - coord2.r) +
      Math.abs(coord1.r - coord2.r)) /
    2
  );
}


// Initialize revealed tiles object with starting tiles and first wave
const getInitialRevealedTiles = (grid: HexGrid) => {
  const initialTiles: Record<string, boolean> = {};

  // Add all tiles within distance 1 of the capital
  Object.entries(grid).forEach(([coord, cell]) => {
    const [q, r] = coord.split(",").map(Number);
    const distanceFromCapital = calculateDistance({ q, r }, CAPITALS.PLAYER_0);
    if (distanceFromCapital <= 1) {
      initialTiles[coord] = true;
    }
  });

  return initialTiles;
};

/**
 * Hook to manage the staggered reveal of game tiles.
 * Tiles are revealed in waves starting from player 0's capital after the first turn.
 */
export const useTileReveal = (grid: HexGrid, isFirstTurn: boolean) => {
  const [revealedTiles, setRevealedTiles] = useState<Record<string, boolean>>(
    () => getInitialRevealedTiles(grid)
  );
  const hasRevealed = useRef(false);

  // Get all tiles sorted by distance from player 0's capital
  const getTilesByDistance = useCallback(() => {
    return Object.entries(grid)
      .map(([coord, cell]) => {
        const [q, r] = coord.split(",").map(Number);
        return {
          coord,
          distance: calculateDistance({ q, r }, CAPITALS.PLAYER_0),
          cell,
        };
      })
      .sort((a, b) => a.distance - b.distance);
  }, [grid]);

  useEffect(() => {
    // If we've already revealed tiles or it's the first turn, don't do anything
    if (hasRevealed.current || isFirstTurn) return;
    hasRevealed.current = true;

    // Get all tiles sorted by distance
    const tilesByDistance = getTilesByDistance();
    const maxDistance = Math.max(...tilesByDistance.map((t) => t.distance));

    let currentWave = 0;
    const revealInterval = setInterval(() => {
      if (currentWave > maxDistance) {
        clearInterval(revealInterval);
        return;
      }

      setRevealedTiles((prev) => {
        const newRevealed = { ...prev };
        tilesByDistance
          .filter((tile) => tile.distance === currentWave)
          .forEach((tile) => (newRevealed[tile.coord] = true));
        return newRevealed;
      });

      currentWave++;
    }, 150);

    return () => clearInterval(revealInterval);
  }, [isFirstTurn, getTilesByDistance]);

  return { revealedTiles };
};
