import { Move } from "buzzwords-shared/Game";
import { emitSelection } from "../../app/socket";
import { AppThunk } from "../../app/store";
import { QRCoord } from "../hexGrid/hexGrid";
import { getOrderedTileSelectionCoords } from "./gameSelectors";
import {
  advanceReplayPlaybackState,
  clearReplay,
  newReplay,
  resetSelection,
  selectTile,
  setSelection,
  unselectTile,
} from "./gameSlice";
// import { getEmptyGame } from "./game";
// import { addGame } from "./gameSlice";

// export const createNewGame =
//   (userId: string): AppThunk =>
//   (dispatch) => {
//     const newGame = getEmptyGame(userId);
//     dispatch(addGame(newGame));
//   };

export const toggleTileSelected =
  (tile: QRCoord): AppThunk =>
  (dispatch, getState) => {
    const selected = getState().game.selectedTiles[tile] || false;
    if (selected) {
      dispatch(unselectTile(tile));
    } else {
      dispatch(selectTile(tile));
    }
    const state = getState();
    emitSelection(state.game.selectedTiles, state.game.currentGame);
  };

export const clearTileSelection = (): AppThunk => (dispatch, getState) => {
  dispatch(resetSelection());
  const { currentGame } = getState().game;
  emitSelection({}, currentGame);
};

export const submitMove =
  (gameId: string): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const move = getOrderedTileSelectionCoords(state);

    const formattedCoords = move.map((coord: QRCoord) => {
      const [q, r] = coord.split(",");
      return {
        q: Number(q),
        r: Number(r),
      };
    });
    console.log("formattedCoords :", formattedCoords);

    try {
      const res = await fetch(`/api/game/${gameId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          move: formattedCoords,
        }),
      }).then((res) => res.json());

      // const newGame: Game = {
      //   ...res,
      //   grid: res.grid.cellMap,
      // };

      // handled by socket msg now
      // dispatch(updateGame(newGame));
      // dispatch(resetSelection());
    } catch (e) {
      console.log(e);
    }
  };

export const receiveSelectionSocket =
  (selection: { [position: QRCoord]: number }, gameId: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { currentGame } = state.game;
    if (!currentGame || currentGame !== gameId) {
      console.log("bailed early", gameId);
      console.log("current game", currentGame);
      return;
      // TODO: show typing indicator in sidebar
    }
    const { user } = state.user;
    const { users, turn } = state.gamelist.games[currentGame];
    const currentUserIndex = user
      ? users.findIndex((val) => val === user.id)
      : null;
    if (currentGame === gameId && currentUserIndex !== turn) {
      dispatch(setSelection(selection));
    }
  };

const REPLAY_DELAY = 2000;
const REPLAY_SPEED = 500;

export const initiateReplay =
  (move: Move): AppThunk =>
  async (dispatch, getState) => {
    dispatch(newReplay(move));
    const ticks = move.letters.length;
    for (let tick = 0; tick < ticks; tick++) {
      window.setTimeout(() => {
        dispatch(advanceReplayPlaybackState());
      }, REPLAY_DELAY + (tick * REPLAY_SPEED));
    }
    setTimeout(() => {
      dispatch(clearReplay());
    }, REPLAY_DELAY + (ticks * REPLAY_SPEED) + REPLAY_SPEED);
  };
