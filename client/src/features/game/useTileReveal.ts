import { useEffect, useState, useMemo, useRef } from "react";
import HexGrid from "buzzwords-shared/hexgrid";
import { calculateHexDistance } from "buzzwords-shared/gridHelpers";

// Game board constants
const CAPITALS = {
  PLAYER_0: { q: -2, r: -1 },
  PLAYER_1: { q: 2, r: 1 },
} as const;

/**
 * Hook to manage the staggered reveal of game tiles.
 * For tutorial games on the first turn, only shows the user's flower and adjacent tiles.
 * After the first turn is submitted, performs a staggered reveal animation.
 * Otherwise, all tiles are revealed immediately.
 */
export const useTileReveal = (
  grid: HexGrid,
  isFirstTurnOfTutorial: boolean,
  shouldDoStaggeredReveal: boolean = false
) => {
  // Store the maximum reveal distance instead of revealed tiles
  // Initial value: 1 if first turn of tutorial, otherwise Infinity (all tiles)
  const [maxRevealDistance, setMaxRevealDistance] = useState<number>(() =>
    isFirstTurnOfTutorial ? 1 : Infinity
  );

  // Ref to track if we're currently animating a staggered reveal
  const isAnimatingRef = useRef(false);
  const prevShouldDoStaggeredRevealRef = useRef(shouldDoStaggeredReveal);

  // Compute revealed tiles from maxRevealDistance
  const revealedTiles = useMemo(() => {
    const revealed: Record<string, boolean> = {};
    Object.keys(grid).forEach((coord) => {
      const [q, r] = coord.split(",").map(Number);
      const distanceFromCapital = calculateHexDistance(
        { q, r },
        CAPITALS.PLAYER_0
      );
      if (distanceFromCapital <= maxRevealDistance) {
        revealed[coord] = true;
      }
    });
    return revealed;
    // Explicitly omitting `grid` from dependencies - it may change, but it'll never resize, and we only care about coords
  }, [maxRevealDistance]);

  // Single useEffect to handle all state transitions
  useEffect(() => {
    if (isFirstTurnOfTutorial) {
      // First turn of tutorial: show only distance 1 tiles
      isAnimatingRef.current = false;
      prevShouldDoStaggeredRevealRef.current = false;
      setMaxRevealDistance(1);
    } else if (shouldDoStaggeredReveal) {
      // Staggered reveal: animate from current distance to max distance
      // Only start if we're transitioning from false to true (not already animating)
      const wasStaggeredReveal = prevShouldDoStaggeredRevealRef.current;
      prevShouldDoStaggeredRevealRef.current = true;

      if (isAnimatingRef.current || wasStaggeredReveal) {
        return;
      }

      isAnimatingRef.current = true;

      // Calculate max distance from grid
      const tilesByDistance = Object.entries(grid).map(([coord, cell]) => {
        const [q, r] = coord.split(",").map(Number);
        return {
          coord,
          distance: calculateHexDistance({ q, r }, CAPITALS.PLAYER_0),
        };
      });

      if (tilesByDistance.length === 0) {
        isAnimatingRef.current = false;
        return;
      }

      const maxDistance = Math.max(...tilesByDistance.map((t) => t.distance));

      // Set up interval to animate from current distance
      const revealInterval = setInterval(() => {
        setMaxRevealDistance((prev) => {
          const nextWave = prev + 1;
          // Check if we've completed all waves
          if (nextWave > maxDistance) {
            isAnimatingRef.current = false;
            return maxDistance;
          }
          return nextWave;
        });
      }, 150);

      // Cleanup function
      return () => {
        clearInterval(revealInterval);
        isAnimatingRef.current = false;
      };
    } else {
      // Normal case: reveal all tiles immediately
      isAnimatingRef.current = false;
      prevShouldDoStaggeredRevealRef.current = false;
      setMaxRevealDistance(Infinity);
    }
  }, [isFirstTurnOfTutorial, shouldDoStaggeredReveal, grid]);

  return { revealedTiles };
};
