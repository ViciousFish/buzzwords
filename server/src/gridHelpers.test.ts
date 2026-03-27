import {
  willConnectToTerritory,
  getCellsToBeReset,
  willBecomeOwned,
} from "buzzwords-shared/gridHelpers";
import HexGrid, { makeHexGrid, setCell } from "buzzwords-shared/hexgrid";

// Set ownership/value on an existing grid cell
function own(
  grid: HexGrid,
  q: number,
  r: number,
  owner: 0 | 1 | 2,
  value = "a",
  capital = false
): void {
  const existing = grid[`${q},${r}`];
  if (existing) {
    setCell(grid, { ...existing, owner, value, capital });
  }
}

// ─── willConnectToTerritory ────────────────────────────────────────────────

describe("willConnectToTerritory", () => {
  it("returns true when a move cell is directly adjacent to owned territory", () => {
    const grid = makeHexGrid();
    own(grid, -2, -1, 0); // player 0 owns this cell
    // (-3,-1) is a neighbor of (-2,-1)
    const move = [{ q: -3, r: -1 }];
    expect(willConnectToTerritory(grid, move, { q: -3, r: -1 }, 0)).toBe(true);
  });

  it("returns false when no player territory exists on the board", () => {
    const grid = makeHexGrid();
    // No cells owned by player 0
    const move = [{ q: 0, r: 0 }];
    expect(willConnectToTerritory(grid, move, { q: 0, r: 0 }, 0)).toBe(false);
  });

  it("returns false when owned territory exists but is not reachable", () => {
    const grid = makeHexGrid();
    // Player 0 owns (2,1) — far from our move cell at (0,0)
    own(grid, 2, 1, 0);
    const move = [{ q: 0, r: 0 }];
    expect(willConnectToTerritory(grid, move, { q: 0, r: 0 }, 0)).toBe(false);
  });

  it("returns true when connected via a chain of move cells", () => {
    const grid = makeHexGrid();
    // Player 0 owns (-2,-1)
    own(grid, -2, -1, 0);
    // Move spans two cells: (-3,-1) adjacent to capital, (-3,0) adjacent to (-3,-1)
    // (-3,0) also has (-2,-1) as a direct neighbor, so it connects directly
    const move = [{ q: -3, r: -1 }, { q: -3, r: 0 }];
    expect(willConnectToTerritory(grid, move, { q: -3, r: 0 }, 0)).toBe(true);
  });

  it("does not count opponent territory as a connection", () => {
    const grid = makeHexGrid();
    own(grid, -2, -1, 1); // owned by player 1, not player 0
    const move = [{ q: -3, r: -1 }];
    expect(willConnectToTerritory(grid, move, { q: -3, r: -1 }, 0)).toBe(false);
  });

  it("returns true for player 1 when adjacent to player 1 territory", () => {
    const grid = makeHexGrid();
    own(grid, 2, 1, 1); // player 1 owns (2,1)
    // (1,1) is a neighbor of (2,1): getCellNeighbors(2,1) includes (1,1) via offset (q+1,r) → (3,1) no, let me use the known offset
    // offsets from (2,1): (1,1),(1,2),(2,0),(2,2),(3,0),(3,1)
    // (1,1) is getCellNeighbors offset (q-1,r) = (1,1) ✓
    const move = [{ q: 1, r: 1 }];
    expect(willConnectToTerritory(grid, move, { q: 1, r: 1 }, 1)).toBe(true);
  });
});

// ─── getCellsToBeReset ─────────────────────────────────────────────────────

describe("getCellsToBeReset", () => {
  it("always includes the move cells themselves", () => {
    const grid = makeHexGrid();
    own(grid, -2, -1, 0); // player 0 capital
    own(grid, -3, -1, 2, "c"); // neutral move cell
    const move = [{ q: -3, r: -1 }];
    const result = getCellsToBeReset(grid, move, 0);
    const coords = result.map((c) => `${c.q},${c.r}`);
    expect(coords).toContain("-3,-1");
  });

  it("includes adjacent opponent cells when the move connects to territory", () => {
    const grid = makeHexGrid();
    own(grid, -2, -1, 0); // player 0 capital
    // (-3,-1) is adjacent to the capital
    // (-3,0) is adjacent to (-3,-1) and is player 1's cell
    own(grid, -3, -1, 2, "x"); // neutral move cell
    own(grid, -3, 0, 1, "b"); // player 1's cell adjacent to (-3,-1)
    const move = [{ q: -3, r: -1 }];
    const result = getCellsToBeReset(grid, move, 0);
    const coords = result.map((c) => `${c.q},${c.r}`);
    expect(coords).toContain("-3,-1");
    expect(coords).toContain("-3,0");
  });

  it("includes adjacent empty-neutral cells when the move connects to territory", () => {
    const grid = makeHexGrid();
    own(grid, -2, -1, 0); // player 0 capital
    own(grid, -3, -1, 2, "c"); // move cell
    // (-3,0) is empty-neutral (owner=2, value="") — adjacent to (-3,-1)
    grid["-3,0"] = { q: -3, r: 0, owner: 2, value: "", capital: false };
    const move = [{ q: -3, r: -1 }];
    const result = getCellsToBeReset(grid, move, 0);
    const coords = result.map((c) => `${c.q},${c.r}`);
    expect(coords).toContain("-3,0");
  });

  it("does not include player's own cells in the reset", () => {
    const grid = makeHexGrid();
    own(grid, -2, -1, 0); // player 0 capital
    own(grid, -2, 0, 0, "x"); // player 0 owns another cell
    own(grid, -3, -1, 2, "c"); // move cell
    const move = [{ q: -3, r: -1 }];
    const result = getCellsToBeReset(grid, move, 0);
    const coords = result.map((c) => `${c.q},${c.r}`);
    expect(coords).not.toContain("-2,-1");
    expect(coords).not.toContain("-2,0");
  });

  it("only includes the move cell when it does not connect to territory", () => {
    const grid = makeHexGrid();
    // No player 0 territory anywhere
    own(grid, 0, 0, 2, "c"); // neutral
    const move = [{ q: 0, r: 0 }];
    const result = getCellsToBeReset(grid, move, 0);
    expect(result).toHaveLength(1);
    expect(result[0].q).toBe(0);
    expect(result[0].r).toBe(0);
  });

  it("handles multi-cell moves — each cell is included", () => {
    const grid = makeHexGrid();
    own(grid, -2, -1, 0);
    own(grid, -3, -1, 2, "c");
    own(grid, -3, 0, 2, "a");
    own(grid, -2, -2, 2, "t");
    const move = [
      { q: -3, r: -1 },
      { q: -3, r: 0 },
      { q: -2, r: -2 },
    ];
    const result = getCellsToBeReset(grid, move, 0);
    const coords = result.map((c) => `${c.q},${c.r}`);
    expect(coords).toContain("-3,-1");
    expect(coords).toContain("-3,0");
    expect(coords).toContain("-2,-2");
  });
});

// ─── willBecomeOwned ──────────────────────────────────────────────────────

describe("willBecomeOwned", () => {
  it("returns cells from the move that connect to the player's territory", () => {
    const grid = makeHexGrid();
    own(grid, -2, -1, 0); // player 0 capital
    const move = [{ q: -3, r: -1 }, { q: -3, r: 0 }];
    const result = willBecomeOwned(grid, move, 0);
    const coords = result.map((c) => `${c.q},${c.r}`);
    expect(coords).toContain("-3,-1");
    expect(coords).toContain("-3,0");
  });

  it("excludes cells that do not connect to territory", () => {
    const grid = makeHexGrid();
    own(grid, -2, -1, 0); // player 0 capital
    // (1,0) is far from player 0 territory
    own(grid, 1, 0, 2, "x");
    const move = [{ q: -3, r: -1 }, { q: 1, r: 0 }];
    const result = willBecomeOwned(grid, move, 0);
    const coords = result.map((c) => `${c.q},${c.r}`);
    expect(coords).toContain("-3,-1");
    expect(coords).not.toContain("1,0");
  });

  it("returns an empty array when no cells connect to territory", () => {
    const grid = makeHexGrid();
    // No player 0 territory
    const move = [{ q: 0, r: 0 }];
    const result = willBecomeOwned(grid, move, 0);
    expect(result).toHaveLength(0);
  });

  it("throws for coordinates that do not exist in the grid", () => {
    const grid = makeHexGrid();
    const move = [{ q: -99, r: -99 }];
    expect(() => willBecomeOwned(grid, move, 0)).toThrow("Invalid coords");
  });

  it("works correctly for player 1", () => {
    const grid = makeHexGrid();
    own(grid, 2, 1, 1); // player 1 capital
    // (1,1) is a neighbor of (2,1)
    const move = [{ q: 1, r: 1 }];
    const result = willBecomeOwned(grid, move, 1);
    expect(result).toHaveLength(1);
    expect(result[0].q).toBe(1);
    expect(result[0].r).toBe(1);
  });
});
