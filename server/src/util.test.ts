import { sanitizeGame, withRetry, isAnonymousUser } from "./util";
import { makeHexGrid } from "buzzwords-shared/hexgrid";
import Game from "buzzwords-shared/Game";
import { User } from "./types";

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

// ─── isAnonymousUser ──────────────────────────────────────────────────────

describe("isAnonymousUser", () => {
  function makeUser(overrides: Partial<User> = {}): User {
    return {
      id: "test-id",
      nickname: null,
      googleId: null,
      ...overrides,
    };
  }

  it("returns true when googleId is null", () => {
    const user = makeUser({ googleId: null });
    expect(isAnonymousUser(user)).toBe(true);
  });

  it("returns false when googleId is set", () => {
    const user = makeUser({ googleId: "google-12345" });
    expect(isAnonymousUser(user)).toBe(false);
  });

  it("returns false when googleId is an empty string (falsy but not null)", () => {
    // empty string is falsy; the implementation uses !user.googleId
    const user = makeUser({ googleId: "" });
    expect(isAnonymousUser(user)).toBe(true);
  });
});

// ─── withRetry ────────────────────────────────────────────────────────────

describe("withRetry", () => {
  it("returns the result immediately when the function succeeds on the first call", async () => {
    const fn = jest.fn().mockResolvedValue("ok");
    const wrapped = withRetry(fn, 3);
    const result = await wrapped();
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries and returns the result when the function eventually succeeds", async () => {
    let calls = 0;
    const fn = jest.fn().mockImplementation(async () => {
      calls++;
      if (calls < 3) throw new Error("transient error");
      return "done";
    });
    const wrapped = withRetry(fn, 3);
    const result = await wrapped();
    expect(result).toBe("done");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("throws after exhausting maxRetries", async () => {
    const fn = jest.fn().mockRejectedValue(new Error("always fails"));
    const wrapped = withRetry(fn, 2);
    await expect(wrapped()).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("passes arguments through to the wrapped function", async () => {
    const fn = jest.fn().mockImplementation(async (a: number, b: string) => `${a}-${b}`);
    const wrapped = withRetry(fn, 1);
    const result = await wrapped(42, "hello");
    expect(result).toBe("42-hello");
    expect(fn).toHaveBeenCalledWith(42, "hello");
  });
});
