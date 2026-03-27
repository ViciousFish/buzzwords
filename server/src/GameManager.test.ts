import GameManager from "./GameManager";
import { makeHexGrid, setCell } from "buzzwords-shared/hexgrid";
import Game from "buzzwords-shared/Game";

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Creates a fresh 2-player game ready for moves.
 * Player 0 = "user1", player 1 = "user2".
 * Capital for player 0 is at (-2,-1); capital for player 1 is at (2,1).
 */
function makeTwoPlayerGame(): { gm: GameManager; game: Game } {
  const gm = new GameManager(null);
  const game = gm.createGame("user1");
  game.users.push("user2");
  return { gm, game };
}

/**
 * Set specific letters on cells adjacent to player 0's capital (-2,-1)
 * to spell the word "cat". The three cells used are:
 *   (-3,-1) = "c"
 *   (-3, 0) = "a"
 *   (-2,-2) = "t"
 * All are neighbours of the capital and are all in-bounds.
 */
function setCatWord(game: Game): void {
  const pairs: [number, number, string][] = [
    [-3, -1, "c"],
    [-3, 0, "a"],
    [-2, -2, "t"],
  ];
  for (const [q, r, value] of pairs) {
    setCell(game.grid, { ...game.grid[`${q},${r}`], owner: 2, value });
  }
}

const CAT_MOVE = [
  { q: -3, r: -1 },
  { q: -3, r: 0 },
  { q: -2, r: -2 },
];

// ─── createGame ───────────────────────────────────────────────────────────

describe("GameManager.createGame", () => {
  it("returns a game with the creating user as the first player", () => {
    const gm = new GameManager(null);
    const game = gm.createGame("user1");
    expect(game.users).toContain("user1");
    expect(game.users[0]).toBe("user1");
  });

  it("sets turn to player 0", () => {
    const gm = new GameManager(null);
    const game = gm.createGame("user1");
    expect(game.turn).toBe(0);
  });

  it("starts with gameOver false and winner null", () => {
    const gm = new GameManager(null);
    const game = gm.createGame("user1");
    expect(game.gameOver).toBe(false);
    expect(game.winner).toBeNull();
  });

  it("player 0 capital is at (-2,-1) and is owned by player 0", () => {
    const gm = new GameManager(null);
    const game = gm.createGame("user1");
    const cap = game.grid["-2,-1"];
    expect(cap.owner).toBe(0);
    expect(cap.capital).toBe(true);
  });

  it("player 1 capital is at (2,1) and is owned by player 1", () => {
    const gm = new GameManager(null);
    const game = gm.createGame("user1");
    const cap = game.grid["2,1"];
    expect(cap.owner).toBe(1);
    expect(cap.capital).toBe(true);
  });

  it("assigns letter values to the neighbours of both capitals", () => {
    const gm = new GameManager(null);
    const game = gm.createGame("user1");
    // All 6 neighbours of each capital should have a non-empty letter value
    const capital0Neighbours = [
      "-3,-1", "-3,0", "-2,-2", "-2,0", "-1,-2", "-1,-1",
    ];
    for (const key of capital0Neighbours) {
      expect(game.grid[key].value).toMatch(/^[a-z]$/);
    }
    const capital1Neighbours = [
      "1,1", "1,2", "2,0", "2,2", "3,0", "3,1",
    ];
    for (const key of capital1Neighbours) {
      expect(game.grid[key].value).toMatch(/^[a-z]$/);
    }
  });

  it("saves rngState after creation", () => {
    const gm = new GameManager(null);
    const game = gm.createGame("user1");
    expect(game.rngState).toBeDefined();
  });

  it("creates a game with a unique id", () => {
    const gm1 = new GameManager(null);
    const gm2 = new GameManager(null);
    const g1 = gm1.createGame("user1");
    const g2 = gm2.createGame("user1");
    expect(g1.id).not.toBe(g2.id);
  });
});

// ─── pass ─────────────────────────────────────────────────────────────────

describe("GameManager.pass", () => {
  it("changes the turn to the next player", () => {
    const { gm, game } = makeTwoPlayerGame();
    expect(game.turn).toBe(0);
    gm.pass("user1");
    expect(game.turn).toBe(1);
  });

  it("records a pass move in game.moves", () => {
    const { gm, game } = makeTwoPlayerGame();
    gm.pass("user1");
    expect(game.moves).toHaveLength(1);
    expect(game.moves[0].pass).toBe(true);
    expect(game.moves[0].player).toBe(0);
    expect(game.moves[0].coords).toEqual([]);
  });

  it("saves rngState after the pass", () => {
    const { gm, game } = makeTwoPlayerGame();
    gm.pass("user1");
    expect(game.rngState).toBeDefined();
  });

  it("throws when there is no game", () => {
    const gm = new GameManager(null);
    expect(() => gm.pass("user1")).toThrow("Game Manager has no game!");
  });

  it("throws when the user is not in the game", () => {
    const { gm } = makeTwoPlayerGame();
    expect(() => gm.pass("stranger")).toThrow("Not your game");
  });

  it("throws when the game is already over", () => {
    const { gm, game } = makeTwoPlayerGame();
    game.gameOver = true;
    expect(() => gm.pass("user1")).toThrow("Game is over");
  });

  it("throws when it is not the user's turn", () => {
    const { gm } = makeTwoPlayerGame();
    expect(() => gm.pass("user2")).toThrow("Not your turn");
  });

  it("throws when there is only one player", () => {
    const gm = new GameManager(null);
    const game = gm.createGame("user1");
    // game.users only has "user1"
    expect(() => gm.pass("user1")).toThrow("Need another player");
  });

  it("assigns a capital to the opponent if they have none", () => {
    const { gm, game } = makeTwoPlayerGame();
    // Remove capital from player 1's capital cell
    game.grid["2,1"].capital = false;
    setCell(game.grid, game.grid["2,1"]);

    gm.pass("user1");

    // Player 1 should now have a capital somewhere
    const p1Capital = Object.values(game.grid).find(
      (c) => c.owner === 1 && c.capital
    );
    expect(p1Capital).toBeDefined();
  });

  it("does not change the opponent's capital if they already have one", () => {
    const { gm, game } = makeTwoPlayerGame();
    // player 1 already has a capital at (2,1)
    const capitalBefore = game.grid["2,1"];
    expect(capitalBefore.capital).toBe(true);

    gm.pass("user1");

    // Still a capital at (2,1)
    expect(game.grid["2,1"].capital).toBe(true);
  });
});

// ─── forfeit ──────────────────────────────────────────────────────────────

describe("GameManager.forfeit", () => {
  it("sets gameOver to true", () => {
    const { gm, game } = makeTwoPlayerGame();
    gm.forfeit("user1");
    expect(game.gameOver).toBe(true);
  });

  it("sets winner to the opponent of the forfeiting player", () => {
    const { gm, game } = makeTwoPlayerGame();
    gm.forfeit("user1"); // user1 is player 0 → opponent (player 1) wins
    expect(game.winner).toBe(1);
  });

  it("works when player 1 forfeits", () => {
    const { gm, game } = makeTwoPlayerGame();
    gm.forfeit("user2"); // user2 is player 1 → player 0 wins
    expect(game.winner).toBe(0);
  });

  it("records a forfeit move in game.moves", () => {
    const { gm, game } = makeTwoPlayerGame();
    gm.forfeit("user1");
    expect(game.moves).toHaveLength(1);
    expect(game.moves[0].forfeit).toBe(true);
    expect(game.moves[0].player).toBe(0);
  });

  it("throws when there is no game", () => {
    const gm = new GameManager(null);
    expect(() => gm.forfeit("user1")).toThrow("Game Manager has no game!");
  });

  it("throws when the user is not in the game", () => {
    const { gm } = makeTwoPlayerGame();
    expect(() => gm.forfeit("stranger")).toThrow("Not your game");
  });

  it("throws when the game is already over", () => {
    const { gm, game } = makeTwoPlayerGame();
    game.gameOver = true;
    expect(() => gm.forfeit("user1")).toThrow("Game is over");
  });

  it("throws when there is only one player", () => {
    const gm = new GameManager(null);
    gm.createGame("user1");
    expect(() => gm.forfeit("user1")).toThrow("Need another player");
  });
});

// ─── makeMove ─────────────────────────────────────────────────────────────

describe("GameManager.makeMove — validation errors", () => {
  it("throws when there is no game", () => {
    const gm = new GameManager(null);
    expect(() => gm.makeMove("user1", CAT_MOVE)).toThrow(
      "Game Manager has no game!"
    );
  });

  it("throws when the user is not in the game", () => {
    const { gm } = makeTwoPlayerGame();
    expect(() => gm.makeMove("stranger", CAT_MOVE)).toThrow("Not your game");
  });

  it("throws when the game is already over", () => {
    const { gm, game } = makeTwoPlayerGame();
    game.gameOver = true;
    expect(() => gm.makeMove("user1", CAT_MOVE)).toThrow("Game is over");
  });

  it("throws when it is not the user's turn", () => {
    const { gm } = makeTwoPlayerGame();
    expect(() => gm.makeMove("user2", CAT_MOVE)).toThrow("Not your turn");
  });

  it("throws when there is only one player", () => {
    const gm = new GameManager(null);
    gm.createGame("user1");
    expect(() => gm.makeMove("user1", [{ q: 0, r: 0 }])).toThrow(
      "Need another player"
    );
  });

  it("throws for coordinates that do not exist in the grid", () => {
    const { gm } = makeTwoPlayerGame();
    expect(() => gm.makeMove("user1", [{ q: -99, r: -99 }])).toThrow(
      "Invalid coords"
    );
  });

  it("throws when a cell is owned (not neutral)", () => {
    const { gm, game } = makeTwoPlayerGame();
    // The capital (-2,-1) is owned by player 0, not neutral
    expect(() =>
      gm.makeMove("user1", [{ q: -2, r: -1 }])
    ).toThrow();
  });

  it("throws for a cell with no letter value", () => {
    const { gm, game } = makeTwoPlayerGame();
    // (0,0) is neutral but has no value — should fail "Cell in use or inactive"
    expect(game.grid["0,0"].value).toBe("");
    expect(() => gm.makeMove("user1", [{ q: 0, r: 0 }])).toThrow();
  });

  it("throws when the spelled word is not in the dictionary", () => {
    const { gm, game } = makeTwoPlayerGame();
    // Set up cells spelling a nonsense word "zzz"
    setCell(game.grid, { ...game.grid["-3,-1"], owner: 2, value: "z" });
    setCell(game.grid, { ...game.grid["-3,0"], owner: 2, value: "z" });
    setCell(game.grid, { ...game.grid["-2,-2"], owner: 2, value: "z" });
    expect(() => gm.makeMove("user1", CAT_MOVE)).toThrow("Not a valid word");
  });
});

describe("GameManager.makeMove — successful move", () => {
  it("move cells become owned by the current player", () => {
    const { gm, game } = makeTwoPlayerGame();
    setCatWord(game);
    gm.makeMove("user1", CAT_MOVE);
    expect(game.grid["-3,-1"].owner).toBe(0);
    expect(game.grid["-3,0"].owner).toBe(0);
    expect(game.grid["-2,-2"].owner).toBe(0);
  });

  it("move cells lose their letter value after being owned", () => {
    const { gm, game } = makeTwoPlayerGame();
    setCatWord(game);
    gm.makeMove("user1", CAT_MOVE);
    expect(game.grid["-3,-1"].value).toBe("");
    expect(game.grid["-3,0"].value).toBe("");
    expect(game.grid["-2,-2"].value).toBe("");
  });

  it("turn changes to the opponent after a normal move", () => {
    const { gm, game } = makeTwoPlayerGame();
    setCatWord(game);
    gm.makeMove("user1", CAT_MOVE);
    expect(game.turn).toBe(1);
  });

  it("appends a move record to game.moves", () => {
    const { gm, game } = makeTwoPlayerGame();
    setCatWord(game);
    gm.makeMove("user1", CAT_MOVE);
    expect(game.moves).toHaveLength(1);
    const recorded = game.moves[0];
    expect(recorded.player).toBe(0);
    expect(recorded.coords).toEqual(CAT_MOVE);
    expect(recorded.letters).toEqual(["c", "a", "t"]);
  });

  it("saves rngState after the move", () => {
    const { gm, game } = makeTwoPlayerGame();
    setCatWord(game);
    gm.makeMove("user1", CAT_MOVE);
    expect(game.rngState).toBeDefined();
  });

  it("reset tiles receive a new non-empty letter value", () => {
    const { gm, game } = makeTwoPlayerGame();
    setCatWord(game);
    // (-3,1) is an empty-neutral neighbour of (-3,0) and will be reset
    expect(game.grid["-3,1"].value).toBe("");
    gm.makeMove("user1", CAT_MOVE);
    // After the move the reset tile should have a new letter
    expect(game.grid["-3,1"].value).toMatch(/^[a-z]$/);
  });
});

describe("GameManager.makeMove — game over", () => {
  it("sets gameOver when all opponent cells are consumed by the move", () => {
    const { gm, game } = makeTwoPlayerGame();

    // Move player 1's only territory to (-2,0), adjacent to player 0's capital
    // First clear the original player 1 capital at (2,1)
    setCell(game.grid, { ...game.grid["2,1"], owner: 2, capital: false, value: "" });
    // And clear the letter-neighbours of (2,1) that createGame populated
    for (const key of ["1,1", "1,2", "2,0", "2,2", "3,0", "3,1"]) {
      setCell(game.grid, { ...game.grid[key], value: "" });
    }

    // Place player 1's only cell at (-2,0) — a neighbour of the player 0 capital
    setCell(game.grid, { ...game.grid["-2,0"], owner: 1, capital: true, value: "" });

    // Set up "cat" on the three cells adjacent to the capital
    setCatWord(game);

    gm.makeMove("user1", CAT_MOVE);

    expect(game.gameOver).toBe(true);
    expect(game.winner).toBe(0);
  });

  it("does not set gameOver when opponent still has cells outside the move", () => {
    const { gm, game } = makeTwoPlayerGame();
    setCatWord(game);
    // Player 1 still owns (2,1) which is nowhere near the move
    gm.makeMove("user1", CAT_MOVE);
    expect(game.gameOver).toBe(false);
  });
});

describe("GameManager.makeMove — capital capture", () => {
  it("does not advance the turn when the current player captures opponent's capital", () => {
    const { gm, game } = makeTwoPlayerGame();

    // Put player 1's capital at (-2,0) — directly adjacent to player 0's capital
    // This means it will be in resetTiles when player 0 plays next to it
    setCell(game.grid, { ...game.grid["2,1"], owner: 1, capital: false, value: "" });
    setCell(game.grid, { ...game.grid["-2,0"], owner: 1, capital: true, value: "x" });

    // Give player 1 a second cell so the game doesn't end immediately
    setCell(game.grid, { ...game.grid["2,0"], owner: 1, capital: false, value: "y" });

    setCatWord(game);
    gm.makeMove("user1", CAT_MOVE);

    // Capital was captured → turn stays at 0
    expect(game.turn).toBe(0);
  });
});
