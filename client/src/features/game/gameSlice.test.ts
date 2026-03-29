import { describe, it, expect } from "vitest";
import gameReducer, {
  selectTile,
  unselectTile,
  resetSelection,
  backspaceSelection,
  setCurrentGame,
  newReplay,
  advanceReplayPlaybackState,
  clearReplay,
  setWindowHasFocus,
  toggleNudgeButton,
  setSocketConnected,
  setFreezeGameBoard,
} from "./gameSlice";

// Build a pre-constructed state that avoids calling document.hasFocus()
// (which is what the slice's real initialState does).  We test the real
// initialState path in the one test below that does pass `undefined`.
function makeState(
  overrides: Record<string, unknown> = {}
): ReturnType<typeof gameReducer> {
  return {
    selectedTiles: {},
    selectionIndex: 0,
    currentGame: null,
    replay: {
      move: null,
      moveListIndex: 0,
      playbackState: null,
      poisonToken: "",
    },
    showingTutorialModal: false,
    windowHasFocus: false,
    gameStateModal: null,
    showingNudgeButton: false,
    socketConnected: false,
    freezeGameBoard: false,
    ...overrides,
  } as ReturnType<typeof gameReducer>;
}

// ─── initialState ─────────────────────────────────────────────────────────

describe("gameSlice initialState", () => {
  it("produces a valid state with no action", () => {
    const state = gameReducer(undefined, { type: "@@init" });
    expect(state.selectedTiles).toEqual({});
    expect(state.selectionIndex).toBe(0);
    expect(state.currentGame).toBeNull();
    expect(state.gameOver).toBeUndefined();
  });
});

// ─── selectTile ───────────────────────────────────────────────────────────

describe("selectTile", () => {
  it("adds the coord with index selectionIndex+1", () => {
    const state = gameReducer(makeState(), selectTile("0,0"));
    expect(state.selectedTiles["0,0"]).toBe(1);
    expect(state.selectionIndex).toBe(1);
  });

  it("assigns incrementing indices for successive selections", () => {
    let state = gameReducer(makeState(), selectTile("0,0"));
    state = gameReducer(state, selectTile("1,0"));
    expect(state.selectedTiles["0,0"]).toBe(1);
    expect(state.selectedTiles["1,0"]).toBe(2);
    expect(state.selectionIndex).toBe(2);
  });
});

// ─── unselectTile ─────────────────────────────────────────────────────────

describe("unselectTile", () => {
  it("removes the coord from selectedTiles", () => {
    const initial = makeState({ selectedTiles: { "0,0": 1 }, selectionIndex: 1 });
    const state = gameReducer(initial, unselectTile("0,0"));
    expect(state.selectedTiles["0,0"]).toBeUndefined();
  });

  it("does not affect other selected tiles", () => {
    const initial = makeState({ selectedTiles: { "0,0": 1, "1,0": 2 }, selectionIndex: 2 });
    const state = gameReducer(initial, unselectTile("0,0"));
    expect(state.selectedTiles["1,0"]).toBe(2);
  });

  it("is a no-op for a coord that was not selected", () => {
    const initial = makeState({ selectedTiles: { "0,0": 1 }, selectionIndex: 1 });
    const state = gameReducer(initial, unselectTile("9,9"));
    expect(Object.keys(state.selectedTiles)).toHaveLength(1);
  });
});

// ─── resetSelection ───────────────────────────────────────────────────────

describe("resetSelection", () => {
  it("clears all selected tiles", () => {
    const initial = makeState({ selectedTiles: { "0,0": 1, "1,0": 2 }, selectionIndex: 2 });
    const state = gameReducer(initial, resetSelection());
    expect(state.selectedTiles).toEqual({});
    expect(state.selectionIndex).toBe(0);
  });
});

// ─── backspaceSelection ───────────────────────────────────────────────────

describe("backspaceSelection", () => {
  it("removes the most recently selected tile (highest index)", () => {
    const initial = makeState({
      selectedTiles: { "0,0": 1, "1,0": 2, "2,0": 3 },
      selectionIndex: 3,
    });
    const state = gameReducer(initial, backspaceSelection());
    expect(state.selectedTiles["2,0"]).toBeUndefined();
    expect(state.selectedTiles["0,0"]).toBe(1);
    expect(state.selectedTiles["1,0"]).toBe(2);
  });

  it("handles a single-tile selection", () => {
    const initial = makeState({ selectedTiles: { "0,0": 1 }, selectionIndex: 1 });
    const state = gameReducer(initial, backspaceSelection());
    expect(state.selectedTiles).toEqual({});
  });
});

// ─── setCurrentGame ───────────────────────────────────────────────────────

describe("setCurrentGame", () => {
  it("sets the current game id", () => {
    const state = gameReducer(makeState(), setCurrentGame("game-123"));
    expect(state.currentGame).toBe("game-123");
  });

  it("resets tile selection and replay state", () => {
    const initial = makeState({
      selectedTiles: { "0,0": 1 },
      selectionIndex: 1,
      replay: { move: { coords: [], grid: {}, letters: [], player: 0 }, moveListIndex: 1, playbackState: 2, poisonToken: "x" },
    });
    const state = gameReducer(initial, setCurrentGame("new-game"));
    expect(state.selectedTiles).toEqual({});
    expect(state.selectionIndex).toBe(0);
    expect(state.replay.move).toBeNull();
    expect(state.replay.playbackState).toBeNull();
  });

  it("accepts null to clear the current game", () => {
    const initial = makeState({ currentGame: "game-123" });
    const state = gameReducer(initial, setCurrentGame(null));
    expect(state.currentGame).toBeNull();
  });
});

// ─── replay reducers ──────────────────────────────────────────────────────

describe("newReplay", () => {
  it("initialises replay with the given move and sets playbackState to 0", () => {
    const move = { coords: [{ q: 0, r: 0 }], grid: {}, letters: ["a"], player: 0 as 0 | 1 };
    const state = gameReducer(
      makeState(),
      newReplay({ move, poison: "tok", index: 3 })
    );
    expect(state.replay.move).toEqual(move);
    expect(state.replay.poisonToken).toBe("tok");
    expect(state.replay.moveListIndex).toBe(3);
    expect(state.replay.playbackState).toBe(0);
  });
});

describe("advanceReplayPlaybackState", () => {
  it("increments playbackState by 1", () => {
    const initial = makeState({
      replay: { move: null, moveListIndex: 0, playbackState: 2, poisonToken: "" },
    });
    const state = gameReducer(initial, advanceReplayPlaybackState());
    expect(state.replay.playbackState).toBe(3);
  });

  it("sets playbackState to 0 when it was null", () => {
    const state = gameReducer(makeState(), advanceReplayPlaybackState());
    expect(state.replay.playbackState).toBe(0);
  });
});

describe("clearReplay", () => {
  it("resets all replay fields", () => {
    const initial = makeState({
      replay: {
        move: { coords: [], grid: {}, letters: [], player: 0 },
        moveListIndex: 5,
        playbackState: 3,
        poisonToken: "tok",
      },
    });
    const state = gameReducer(initial, clearReplay());
    expect(state.replay.move).toBeNull();
    expect(state.replay.playbackState).toBeNull();
    expect(state.replay.poisonToken).toBe("");
    expect(state.replay.moveListIndex).toBe(0);
  });
});

// ─── UI flag reducers ─────────────────────────────────────────────────────

describe("setWindowHasFocus", () => {
  it("updates windowHasFocus", () => {
    const state = gameReducer(makeState(), setWindowHasFocus(true));
    expect(state.windowHasFocus).toBe(true);
  });
});

describe("toggleNudgeButton", () => {
  it("sets showingNudgeButton", () => {
    const state = gameReducer(makeState(), toggleNudgeButton(true));
    expect(state.showingNudgeButton).toBe(true);
  });
});

describe("setSocketConnected", () => {
  it("updates socketConnected", () => {
    const state = gameReducer(makeState(), setSocketConnected(true));
    expect(state.socketConnected).toBe(true);
  });
});

describe("setFreezeGameBoard", () => {
  it("updates freezeGameBoard", () => {
    const state = gameReducer(makeState(), setFreezeGameBoard(true));
    expect(state.freezeGameBoard).toBe(true);
  });
});
