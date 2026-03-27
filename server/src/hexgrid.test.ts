import {
  makeHexGrid,
  getCell,
  setCell,
  getCellNeighbors,
  getPotentialWords,
  getNewCellValues,
} from "buzzwords-shared/hexgrid";
import { makeCell } from "buzzwords-shared/cell";
import { createRNG } from "buzzwords-shared/utils";
import { WordsObject } from "./words";

const TEST_SEED = 12345;

describe("makeHexGrid", () => {
  it("creates a non-empty grid", () => {
    const grid = makeHexGrid();
    expect(Object.keys(grid).length).toBeGreaterThan(0);
  });

  it("contains cells at the two capital positions", () => {
    const grid = makeHexGrid();
    expect(grid["-2,-1"]).toBeDefined();
    expect(grid["2,1"]).toBeDefined();
  });

  it("contains the center cell", () => {
    const grid = makeHexGrid();
    expect(grid["0,0"]).toBeDefined();
  });

  it("does not contain cells outside the grid boundary", () => {
    const grid = makeHexGrid();
    expect(grid["-4,0"]).toBeUndefined();
    expect(grid["4,0"]).toBeUndefined();
    expect(grid["0,5"]).toBeUndefined();
  });

  it("creates cells with default neutral state", () => {
    const grid = makeHexGrid();
    const cell = grid["-2,-1"];
    expect(cell.q).toBe(-2);
    expect(cell.r).toBe(-1);
    expect(cell.value).toBe("");
    expect(cell.owner).toBe(2);
    expect(cell.capital).toBe(false);
  });

  it("cell keys match their q,r coordinates", () => {
    const grid = makeHexGrid();
    for (const [key, cell] of Object.entries(grid)) {
      expect(key).toBe(`${cell.q},${cell.r}`);
    }
  });

  it("accepts a custom cellMap", () => {
    const custom = { "0,0": makeCell(0, 0) };
    const grid = makeHexGrid(custom);
    expect(grid["0,0"]).toBeDefined();
    expect(Object.keys(grid).length).toBe(1);
  });
});

describe("getCell", () => {
  it("returns the correct cell for a valid coordinate", () => {
    const grid = makeHexGrid();
    const cell = getCell(grid, -2, -1);
    expect(cell).not.toBeNull();
    expect(cell?.q).toBe(-2);
    expect(cell?.r).toBe(-1);
  });

  it("returns a falsy value for coordinates not in the grid", () => {
    const grid = makeHexGrid();
    expect(getCell(grid, -4, 0)).toBeFalsy();
    expect(getCell(grid, 0, 10)).toBeFalsy();
    expect(getCell(grid, 99, 99)).toBeFalsy();
  });

  it("returns a cell consistent with what makeHexGrid set", () => {
    const grid = makeHexGrid();
    const cell = getCell(grid, 0, 0);
    expect(cell?.owner).toBe(2);
    expect(cell?.capital).toBe(false);
    expect(cell?.value).toBe("");
  });
});

describe("setCell", () => {
  it("updates a cell in the grid", () => {
    const grid = makeHexGrid();
    const updated = { ...makeCell(0, 0), value: "x", owner: 0 as 0 | 1 | 2 };
    setCell(grid, updated);
    const retrieved = getCell(grid, 0, 0);
    expect(retrieved?.value).toBe("x");
    expect(retrieved?.owner).toBe(0);
  });

  it("returns the same grid object (mutates in place)", () => {
    const grid = makeHexGrid();
    const updated = { ...makeCell(0, 0), value: "z" };
    const returned = setCell(grid, updated);
    expect(returned).toBe(grid);
  });

  it("overwrites all cell properties", () => {
    const grid = makeHexGrid();
    const cell = { q: 0, r: 0, value: "q", owner: 1 as 0 | 1 | 2, capital: true };
    setCell(grid, cell);
    expect(grid["0,0"].capital).toBe(true);
    expect(grid["0,0"].owner).toBe(1);
    expect(grid["0,0"].value).toBe("q");
  });
});

describe("getCellNeighbors", () => {
  it("returns exactly 6 neighbors for an interior cell", () => {
    const grid = makeHexGrid();
    const neighbors = getCellNeighbors(grid, 0, 0);
    expect(neighbors).toHaveLength(6);
  });

  it("returns fewer than 6 neighbors for edge cells", () => {
    const grid = makeHexGrid();
    // (-3,-1) is in the corner — not all 6 offsets map to valid cells
    const neighbors = getCellNeighbors(grid, -3, -1);
    expect(neighbors.length).toBeLessThan(6);
  });

  it("returns the 6 correct neighbors for the center cell", () => {
    const grid = makeHexGrid();
    // Offsets: (q-1,r), (q-1,r+1), (q,r-1), (q,r+1), (q+1,r-1), (q+1,r)
    const neighbors = getCellNeighbors(grid, 0, 0);
    const coords = neighbors.map((c) => `${c.q},${c.r}`);
    expect(coords).toContain("-1,0");
    expect(coords).toContain("-1,1");
    expect(coords).toContain("0,-1");
    expect(coords).toContain("0,1");
    expect(coords).toContain("1,-1");
    expect(coords).toContain("1,0");
  });

  it("all returned cells exist in the grid", () => {
    const grid = makeHexGrid();
    const neighbors = getCellNeighbors(grid, -1, 0);
    for (const neighbor of neighbors) {
      expect(getCell(grid, neighbor.q, neighbor.r)).not.toBeNull();
    }
  });

  it("the relationship is symmetric — if B is a neighbor of A, A is a neighbor of B", () => {
    const grid = makeHexGrid();
    const neighbors = getCellNeighbors(grid, 0, 0);
    for (const neighbor of neighbors) {
      const backNeighbors = getCellNeighbors(grid, neighbor.q, neighbor.r);
      const backCoords = backNeighbors.map((c) => `${c.q},${c.r}`);
      expect(backCoords).toContain("0,0");
    }
  });
});

describe("getPotentialWords", () => {
  it("returns a non-empty list for common letter combinations", () => {
    const rng = createRNG(TEST_SEED);
    const result = getPotentialWords(["c", "a", "t"], 1, WordsObject, rng);
    expect(result.length).toBeGreaterThan(0);
  });

  it("can produce 'cat' given the letters c, a and one extra slot", () => {
    const rng = createRNG(TEST_SEED);
    const result = getPotentialWords(["c", "a"], 1, WordsObject, rng);
    // There should be words that use c and a and fit within 3 letters (1 extra slot)
    expect(result.some((w) => w.includes("c") && w.includes("a"))).toBe(true);
  });

  it("returns words no longer than toBeResetLength when no letters are provided", () => {
    const rng = createRNG(TEST_SEED);
    const result = getPotentialWords([], 3, WordsObject, rng);
    result.forEach((word) => {
      expect(word.length).toBeLessThanOrEqual(3);
    });
  });

  it("is deterministic with a seeded RNG", () => {
    const rng1 = createRNG(TEST_SEED);
    const rng2 = createRNG(TEST_SEED);
    const r1 = getPotentialWords(["e", "a"], 2, WordsObject, rng1);
    const r2 = getPotentialWords(["e", "a"], 2, WordsObject, rng2);
    expect(r1).toEqual(r2);
  });
});

describe("getNewCellValues", () => {
  it("returns the exact number of letters requested", () => {
    const rng = createRNG(TEST_SEED);
    const result = getNewCellValues(["c", "a"], 3, WordsObject, rng);
    expect(result).toHaveLength(3);
  });

  it("returns only lowercase letters", () => {
    const rng = createRNG(TEST_SEED);
    const result = getNewCellValues(["c", "a"], 4, WordsObject, rng);
    result.forEach((letter) => {
      expect(/^[a-z]$/.test(letter)).toBe(true);
    });
  });

  it("returns empty array when resetTileTotal is 0", () => {
    const rng = createRNG(TEST_SEED);
    const result = getNewCellValues(["c", "a", "t"], 0, WordsObject, rng);
    expect(result).toEqual([]);
  });

  it("is deterministic with a seeded RNG", () => {
    const rng1 = createRNG(TEST_SEED);
    const rng2 = createRNG(TEST_SEED);
    const r1 = getNewCellValues(["c", "a"], 2, WordsObject, rng1);
    const r2 = getNewCellValues(["c", "a"], 2, WordsObject, rng2);
    expect(r1).toEqual(r2);
  });

  it("throws when no word combinations are possible", () => {
    // Pass a dictionary with only one word that cannot be formed
    const tinyDict = { zzzzzzzzzzzz: 1 };
    const rng = createRNG(TEST_SEED);
    expect(() => getNewCellValues([], 2, tinyDict, rng)).toThrow(
      "No possible combinations"
    );
  });

  it("does not repeat any letter more than 3 times across board + new tiles", () => {
    const rng = createRNG(TEST_SEED);
    // Letters on board already have 2 e's
    const letters = ["e", "e"];
    const result = getNewCellValues(letters, 5, WordsObject, rng);
    const allLetters = [...letters, ...result];
    const counts: Record<string, number> = {};
    for (const l of allLetters) {
      counts[l] = (counts[l] ?? 0) + 1;
    }
    // No letter should appear more than 3 times (MAX_REPEATED_LETTER)
    for (const count of Object.values(counts)) {
      expect(count).toBeLessThanOrEqual(3);
    }
  });
});
