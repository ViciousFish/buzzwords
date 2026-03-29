import { describe, it, expect } from "vitest";
import {
  getOrderedTileSelectionCoords,
  getTileSelectionInParsedHexCoords,
  getHightlightedCoordsForCurrentReplayState,
} from "./gameSelectors";
import { RootState } from "../../app/store";

// Construct a minimal RootState with only the fields these selectors need.
// Using `as unknown as RootState` avoids importing every slice just for types.
function makeGameState(selectedTiles: Record<string, number> = {}) {
  return {
    game: {
      selectedTiles,
      selectionIndex: Object.keys(selectedTiles).length,
      replay: {
        move: null,
        moveListIndex: 0,
        playbackState: null,
        poisonToken: "",
      },
    },
  } as unknown as RootState;
}

// ─── getOrderedTileSelectionCoords ────────────────────────────────────────

describe("getOrderedTileSelectionCoords", () => {
  it("returns an empty array when no tiles are selected", () => {
    const state = makeGameState({});
    expect(getOrderedTileSelectionCoords(state)).toEqual([]);
  });

  it("returns a single coord when one tile is selected", () => {
    const state = makeGameState({ "0,0": 1 });
    expect(getOrderedTileSelectionCoords(state)).toEqual(["0,0"]);
  });

  it("returns coords sorted by their selection index (ascending)", () => {
    // Third tile selected first → index=1, first tile second → index=2, etc.
    const state = makeGameState({ "0,0": 2, "1,0": 1, "0,1": 3 });
    expect(getOrderedTileSelectionCoords(state)).toEqual([
      "1,0",
      "0,0",
      "0,1",
    ]);
  });

  it("handles out-of-order indices correctly", () => {
    const state = makeGameState({ "-1,-1": 3, "2,0": 1, "-2,1": 2 });
    const result = getOrderedTileSelectionCoords(state);
    expect(result[0]).toBe("2,0");
    expect(result[1]).toBe("-2,1");
    expect(result[2]).toBe("-1,-1");
  });
});

// ─── getTileSelectionInParsedHexCoords ────────────────────────────────────

describe("getTileSelectionInParsedHexCoords", () => {
  it("returns an empty array when no tiles are selected", () => {
    const state = makeGameState({});
    expect(getTileSelectionInParsedHexCoords(state)).toEqual([]);
  });

  it("parses 'q,r' strings to {q, r} objects in selection order", () => {
    const state = makeGameState({ "-1,-2": 1, "3,0": 2 });
    const result = getTileSelectionInParsedHexCoords(state);
    expect(result).toEqual([
      { q: -1, r: -2 },
      { q: 3, r: 0 },
    ]);
  });

  it("produces numeric q and r values (not strings)", () => {
    const state = makeGameState({ "-2,-1": 1 });
    const result = getTileSelectionInParsedHexCoords(state);
    expect(typeof result[0].q).toBe("number");
    expect(typeof result[0].r).toBe("number");
  });
});

// ─── getHightlightedCoordsForCurrentReplayState ───────────────────────────

describe("getHightlightedCoordsForCurrentReplayState", () => {
  it("returns undefined when there is no replay move", () => {
    const state = makeGameState();
    expect(getHightlightedCoordsForCurrentReplayState(state)).toBeUndefined();
  });

  it("returns the first N coords based on playbackState", () => {
    const state = {
      game: {
        selectedTiles: {},
        selectionIndex: 0,
        replay: {
          move: {
            coords: [
              { q: 0, r: 0 },
              { q: 1, r: 0 },
              { q: 2, r: 0 },
            ],
            grid: {},
            letters: ["a", "b", "c"],
            player: 0 as 0 | 1,
          },
          moveListIndex: 0,
          playbackState: 2,
          poisonToken: "abc",
        },
      },
    } as unknown as RootState;

    const result = getHightlightedCoordsForCurrentReplayState(state);
    expect(result).toHaveLength(2);
    expect(result?.[0]).toEqual({ q: 0, r: 0 });
    expect(result?.[1]).toEqual({ q: 1, r: 0 });
  });

  it("returns all coords when playbackState equals move length", () => {
    const coords = [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ];
    const state = {
      game: {
        selectedTiles: {},
        selectionIndex: 0,
        replay: {
          move: { coords, grid: {}, letters: ["a", "b"], player: 0 as 0 | 1 },
          moveListIndex: 0,
          playbackState: 2,
          poisonToken: "abc",
        },
      },
    } as unknown as RootState;

    const result = getHightlightedCoordsForCurrentReplayState(state);
    expect(result).toHaveLength(2);
  });

  it("returns empty array when playbackState is 0", () => {
    const state = {
      game: {
        selectedTiles: {},
        selectionIndex: 0,
        replay: {
          move: {
            coords: [{ q: 0, r: 0 }],
            grid: {},
            letters: ["a"],
            player: 0 as 0 | 1,
          },
          moveListIndex: 0,
          playbackState: 0,
          poisonToken: "abc",
        },
      },
    } as unknown as RootState;

    const result = getHightlightedCoordsForCurrentReplayState(state);
    expect(result).toHaveLength(0);
  });
});
