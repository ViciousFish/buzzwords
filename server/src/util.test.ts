import { sanitizeGame } from "./util";
import { makeHexGrid } from "buzzwords-shared/hexgrid";
import Game from "buzzwords-shared/Game";

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    id: "test-id",
    users: ["user1", "user2"],
    vsAI: false,
    difficulty: 1,
    turn: 0,
    grid: makeHexGrid(),
    gameOver: false,
    winner: null,
    moves: [],
    deleted: false,
    ...overrides,
  };
}

describe("sanitizeGame", () => {
  it("strips rngSeed", () => {
    const game = makeGame({ rngSeed: "my-secret-seed" });
    const result = sanitizeGame(game);
    expect(result).not.toHaveProperty("rngSeed");
  });

  it("strips rngState", () => {
    const game = makeGame({ rngState: { i: 1, j: 2, S: [] } as any });
    const result = sanitizeGame(game);
    expect(result).not.toHaveProperty("rngState");
  });

  it("preserves all other game fields", () => {
    const game = makeGame({ rngSeed: "seed", rngState: {} as any });
    const result = sanitizeGame(game);
    expect(result.id).toBe("test-id");
    expect(result.users).toEqual(["user1", "user2"]);
    expect(result.turn).toBe(0);
    expect(result.gameOver).toBe(false);
  });

  it("strips _id fields from nested objects (Mongoose documents)", () => {
    const game = makeGame() as any;
    game._id = "mongo-id";
    game.moves = [{ _id: "move-id", player: 0, coords: [], letters: [], grid: {} }];
    const result = sanitizeGame(game) as any;
    expect(result).not.toHaveProperty("_id");
    expect(result.moves[0]).not.toHaveProperty("_id");
  });

  it("does not mutate the original game", () => {
    const game = makeGame({ rngSeed: "seed" });
    sanitizeGame(game);
    expect(game.rngSeed).toBe("seed");
  });
});
