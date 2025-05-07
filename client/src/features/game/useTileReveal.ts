import { useEffect, useState, useRef, useCallback } from 'react';
import { HexCoord } from 'buzzwords-shared/types';
import HexGrid from 'buzzwords-shared/hexgrid';

// Game board constants
const CAPITALS = {
  PLAYER_0: { q: -2, r: -1 },
  PLAYER_1: { q: 2, r: 1 }
} as const;

const STARTING_TILES = [
  { q: -3, r: 0 },
  { q: -2, r: 0 },
  { q: -2, r: -2 },
  { q: -1, r: -1 },
  { q: -3, r: -1 },
  { q: -1, r: -2 },
  { q: -2, r: -1 }
] as const;

// Helper functions
const calculateDistance = (coord1: HexCoord, coord2: HexCoord): number => {
  return (Math.abs(coord1.q - coord2.q) + 
          Math.abs(coord1.q + coord1.r - coord2.q - coord2.r) + 
          Math.abs(coord1.r - coord2.r)) / 2;
};

const coordToString = (coord: HexCoord): string => `${coord.q},${coord.r}`;

/**
 * Hook to manage the staggered reveal of game tiles.
 * Tiles are revealed in waves starting from player 0's capital after the first turn.
 */
export const useTileReveal = (
  grid: HexGrid,
  isFirstTurn: boolean
) => {
  const [revealedTiles, setRevealedTiles] = useState<Set<string>>(new Set());
  const hasRevealed = useRef(false);

  // Get all tiles sorted by distance from player 0's capital
  const getTilesByDistance = useCallback(() => {
    return Object.entries(grid)
      .map(([coord, cell]) => {
        const [q, r] = coord.split(',').map(Number);
        return {
          coord,
          distance: calculateDistance({ q, r }, CAPITALS.PLAYER_0),
          cell
        };
      })
      .sort((a, b) => a.distance - b.distance);
  }, [grid]);

  useEffect(() => {
    // During first turn, only show starting tiles and player 0's capital
    if (isFirstTurn) {
      const startingTiles = new Set([
        ...STARTING_TILES.map(coordToString),
        coordToString(CAPITALS.PLAYER_0)
      ]);
      setRevealedTiles(startingTiles);
      return;
    }

    // Only do the reveal once after the first turn
    if (hasRevealed.current) return;
    hasRevealed.current = true;

    // Start with starting tiles and player 0's capital
    const initialRevealed = new Set([
      ...STARTING_TILES.map(coordToString),
      coordToString(CAPITALS.PLAYER_0)
    ]);
    setRevealedTiles(initialRevealed);

    // Reveal remaining tiles in waves based on distance from player 0's capital
    const tilesByDistance = getTilesByDistance();
    let currentWave = 0;
    const maxDistance = Math.max(...tilesByDistance.map(t => t.distance));

    // Reveal first wave immediately
    setRevealedTiles(prev => {
      const newRevealed = new Set(prev);
      tilesByDistance
        .filter(tile => tile.distance === currentWave)
        .forEach(tile => newRevealed.add(tile.coord));
      return newRevealed;
    });
    currentWave++;

    // Start interval for subsequent waves
    const revealInterval = setInterval(() => {
      if (currentWave > maxDistance) {
        clearInterval(revealInterval);
        return;
      }

      setRevealedTiles(prev => {
        const newRevealed = new Set(prev);
        tilesByDistance
          .filter(tile => tile.distance === currentWave)
          .forEach(tile => newRevealed.add(tile.coord));
        return newRevealed;
      });
      
      currentWave++;
    }, 150);

    return () => clearInterval(revealInterval);
  }, [isFirstTurn, getTilesByDistance]);

  return { revealedTiles };
}; 
