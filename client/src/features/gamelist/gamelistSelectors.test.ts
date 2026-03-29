import { describe, it, expect } from "vitest";
import { getHowManyGamesAreMyTurn } from "./gamelistSelectors";
import { RootState } from "../../app/store";
import Game, { ShallowGame } from "buzzwords-shared/Game";

// Build a minimal ShallowGame (no moves or full grid needed for this selector).
function makeShallowGame(
  id: string,
  users: string[],
  turn: 0 | 1,
  gameOver = false
): ShallowGame {
  return { id, users, turn, gameOver, vsAI: false, difficulty: 1, deleted: false };
}

// Build the slice of state getHowManyGamesAreMyTurn actually reads.
function makeState(
  games: Record<string, ShallowGame | Game>,
  userId: string,
  currentGame: string | null = null
) {
  return {
    gamelist: { games },
    user: { user: { id: userId, nickname: null } },
  } as unknown as RootState;
}

// ─── getHowManyGamesAreMyTurn ─────────────────────────────────────────────

describe("getHowManyGamesAreMyTurn", () => {
  it("returns 0 when there are no games", () => {
    const state = makeState({}, "user1");
    expect(getHowManyGamesAreMyTurn(state, null)).toBe(0);
  });

  it("returns 0 when there is no logged-in user", () => {
    const games = { g1: makeShallowGame("g1", ["user1", "user2"], 0) };
    const state = {
      gamelist: { games },
      user: { user: null },
    } as unknown as RootState;
    expect(getHowManyGamesAreMyTurn(state, null)).toBe(0);
  });

  it("counts games where it is the user's turn", () => {
    const games = {
      g1: makeShallowGame("g1", ["user1", "user2"], 0), // user1's turn
      g2: makeShallowGame("g2", ["user1", "user2"], 1), // user2's turn
      g3: makeShallowGame("g3", ["user1", "user2"], 0), // user1's turn
    };
    const state = makeState(games, "user1");
    expect(getHowManyGamesAreMyTurn(state, null)).toBe(2);
  });

  it("excludes the currently viewed game", () => {
    const games = {
      g1: makeShallowGame("g1", ["user1", "user2"], 0), // user1's turn
      g2: makeShallowGame("g2", ["user1", "user2"], 0), // user1's turn (current)
    };
    const state = makeState(games, "user1");
    // g2 is the current game → excluded from count
    expect(getHowManyGamesAreMyTurn(state, "g2")).toBe(1);
  });

  it("excludes games that are over", () => {
    const games = {
      g1: makeShallowGame("g1", ["user1", "user2"], 0, true), // over
      g2: makeShallowGame("g2", ["user1", "user2"], 0, false), // active
    };
    const state = makeState(games, "user1");
    expect(getHowManyGamesAreMyTurn(state, null)).toBe(1);
  });

  it("excludes games with fewer than 2 players", () => {
    const games = {
      g1: makeShallowGame("g1", ["user1"], 0), // waiting for opponent
    };
    const state = makeState(games, "user1");
    expect(getHowManyGamesAreMyTurn(state, null)).toBe(0);
  });

  it("correctly identifies player index for user2 (index 1)", () => {
    const games = {
      g1: makeShallowGame("g1", ["user1", "user2"], 1), // turn=1 → user2's turn
    };
    const state = makeState(games, "user2");
    expect(getHowManyGamesAreMyTurn(state, null)).toBe(1);
  });

  it("returns 0 when none of the user's games have their turn active", () => {
    const games = {
      g1: makeShallowGame("g1", ["user1", "user2"], 1), // user2's turn
      g2: makeShallowGame("g2", ["user1", "user2"], 1), // user2's turn
    };
    const state = makeState(games, "user1");
    expect(getHowManyGamesAreMyTurn(state, null)).toBe(0);
  });
});
