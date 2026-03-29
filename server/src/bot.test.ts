import { getBotMove } from "buzzwords-shared/bot";
import { makeHexGrid, setCell } from "buzzwords-shared/hexgrid";
import { createRNG } from "buzzwords-shared/utils";
import { WordsObject, BannedWordsObject } from "./words";
import HexGrid from "buzzwords-shared/hexgrid";

const TEST_SEED = 12345;

/**
 * Build a minimal grid for the bot (player 1):
 *  - Bot capital at (2,1)
 *  - Three adjacent open tiles with letters spelling "cat"
 */
function makeBotGrid(): HexGrid {
  const grid = makeHexGrid();
  // Bot capital
  setCell(grid, { ...grid["2,1"], owner: 1, capital: true, value: "" });
  // Three neighbours of (2,1) with letters
  setCell(grid, { ...grid["1,1"], owner: 2, value: "c" });
  setCell(grid, { ...grid["1,2"], owner: 2, value: "a" });
  setCell(grid, { ...grid["2,0"], owner: 2, value: "t" });
  return grid;
}

const defaultOptions = {
  difficulty: 5,
  words: WordsObject,
  bannedWords: BannedWordsObject,
};

// ─── getBotMove ───────────────────────────────────────────────────────────

describe("getBotMove", () => {
  it("throws when the bot has no capital", () => {
    const grid = makeHexGrid();
    // No player 1 capital anywhere
    expect(() => getBotMove(grid, defaultOptions)).toThrow();
  });

  it("returns a non-empty array of coordinates", () => {
    const grid = makeBotGrid();
    const rng = createRNG(TEST_SEED);
    const move = getBotMove(grid, defaultOptions, rng);
    expect(move.length).toBeGreaterThan(0);
  });

  it("is deterministic with a seeded RNG", () => {
    const grid1 = makeBotGrid();
    const grid2 = makeBotGrid();
    const rng1 = createRNG(TEST_SEED);
    const rng2 = createRNG(TEST_SEED);
    const m1 = getBotMove(grid1, defaultOptions, rng1);
    const m2 = getBotMove(grid2, defaultOptions, rng2);
    expect(m1).toEqual(m2);
  });

  it("returns coordinates that exist in the grid", () => {
    const grid = makeBotGrid();
    const rng = createRNG(TEST_SEED);
    const move = getBotMove(grid, defaultOptions, rng);
    for (const coord of move) {
      expect(grid[`${coord.q},${coord.r}`]).toBeDefined();
    }
  });

  it("only selects neutral (owner=2) open tiles", () => {
    const grid = makeBotGrid();
    const rng = createRNG(TEST_SEED);
    const move = getBotMove(grid, defaultOptions, rng);
    for (const coord of move) {
      const cell = grid[`${coord.q},${coord.r}`];
      expect(cell.owner).toBe(2);
      expect(cell.value).not.toBe("");
    }
  });

  it("never selects the bot's capital cell", () => {
    const grid = makeBotGrid();
    const rng = createRNG(TEST_SEED);
    const move = getBotMove(grid, defaultOptions, rng);
    const coords = move.map((c) => `${c.q},${c.r}`);
    expect(coords).not.toContain("2,1");
  });

  it("returns word coordinates whose letters spell a valid word", () => {
    const grid = makeBotGrid();
    const rng = createRNG(TEST_SEED);
    const move = getBotMove(grid, defaultOptions, rng);
    const word = move.map((c) => grid[`${c.q},${c.r}`].value).join("");
    expect(word.length).toBeGreaterThanOrEqual(3);
    expect(WordsObject[word]).toBeDefined();
  });

  it("respects difficulty — higher difficulty tends to pick longer words", () => {
    // Run many games with difficulty 1 vs difficulty 9 and compare median lengths
    const shortMoves: number[] = [];
    const longMoves: number[] = [];
    for (let i = 0; i < 20; i++) {
      const g1 = makeBotGrid();
      const g2 = makeBotGrid();
      const rng = createRNG(TEST_SEED + i);
      shortMoves.push(
        getBotMove(g1, { ...defaultOptions, difficulty: 1 }, rng).length
      );
      longMoves.push(
        getBotMove(g2, { ...defaultOptions, difficulty: 9 }, rng).length
      );
    }
    const avgShort = shortMoves.reduce((a, b) => a + b, 0) / shortMoves.length;
    const avgLong = longMoves.reduce((a, b) => a + b, 0) / longMoves.length;
    // Higher difficulty should generally choose equal or longer words
    expect(avgLong).toBeGreaterThanOrEqual(avgShort);
  });

  it("works on a grid with many open tiles", () => {
    const grid = makeHexGrid();
    // Bot capital with many open neighbours
    setCell(grid, { ...grid["2,1"], owner: 1, capital: true, value: "" });
    const letters = "thequickbrownfoxjumps";
    const open = Object.values(grid).filter(
      (c) => c.owner === 2 && !c.capital
    );
    open.slice(0, letters.length).forEach((c, i) => {
      setCell(grid, { ...c, value: letters[i] });
    });
    const rng = createRNG(TEST_SEED);
    const move = getBotMove(grid, defaultOptions, rng);
    expect(move.length).toBeGreaterThan(0);
  });
});
