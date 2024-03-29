import { nanoid } from "@reduxjs/toolkit";
import Game from "buzzwords-shared/Game";

import { Api } from "../../app/Api";
import { getApiUrl } from "../../app/apiPrefix";
import { emitSelection } from "../../app/socket";
import { AppThunk } from "../../app/store";
import { markGameAsSeen } from "../gamelist/gamelistActions";
import { QRCoord } from "../hexGrid/hexGrid";
import { getOrderedTileSelectionCoords } from "./gameSelectors";
import {
  advanceReplayPlaybackState,
  backspaceSelection,
  clearReplay,
  newReplay,
  resetSelection,
  selectTile,
  setSelection,
  setWindowHasFocus,
  toggleNudgeButton,
  unselectTile,
} from "./gameSlice";

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

export const backspaceTileSelection = (): AppThunk => (dispatch, getState) => {
  dispatch(backspaceSelection());
  const { currentGame, selectedTiles } = getState().game;
  emitSelection(selectedTiles, currentGame);
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

    try {
      await Api.post(getApiUrl("/game", gameId, "/move"), {
        move: formattedCoords,
      });
    } catch (e) {
      if (e.response.data === "Invalid coords") {
        window.alert("Sorry, something went wrong on our end. Reloading");
        location.reload();
      }

      throw (
        e.response?.data ??
        (e.response?.status
          ? `Error ${e.response?.status}`
          : "Something went wrong")
      );
    }

    // handled by socket msg now
    // dispatch(updateGame(newGame));
    // dispatch(resetSelection());
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
const REPLAY_HANG = 2000;

export const initiateReplay =
  (moveIndex: number, skipInitialDelay?: boolean): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const currentGame = getState().game.currentGame;
    if (!currentGame) {
      console.error("can't init replay on null game");
      return;
    }
    const move = (getState().gamelist.games[currentGame] as Game).moves[
      moveIndex
    ];
    const poison = nanoid();
    const delay = skipInitialDelay ? 0 : REPLAY_DELAY;

    dispatch(newReplay({ move, poison, index: moveIndex }));

    const ticks = move.letters.length;
    for (let tick = 0; tick < ticks; tick++) {
      window.setTimeout(() => {
        if (
          getState().game.replay.poisonToken === poison &&
          getState().game.currentGame === currentGame
        ) {
          dispatch(advanceReplayPlaybackState());
        }
      }, delay + tick * REPLAY_SPEED);
    }
    await new Promise<void>((resolve) =>
      setTimeout(() => {
        if (
          getState().game.replay.poisonToken === poison &&
          getState().game.currentGame === currentGame
        ) {
          const nextMove = (getState().gamelist.games[currentGame] as Game)
            .moves[moveIndex + 1];
          if (nextMove) {
            dispatch(newReplay({ move: nextMove, poison, index: moveIndex }));
            setTimeout(() => {
              dispatch(clearReplay());
              resolve();
            }, REPLAY_HANG);
          } else {
            dispatch(clearReplay());
            resolve();
          }
        }
      }, delay + ticks * REPLAY_SPEED + REPLAY_SPEED)
    );
  };

export const handleWindowFocusThunk =
  (focus: boolean): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    if (focus && state.game.currentGame) {
      dispatch(markGameAsSeen(state.game.currentGame));
    }
    dispatch(setWindowHasFocus(focus));
  };

export const maybeShowNudge =
  (gameId: string, turnNumber: number): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const game = state.gamelist.games[gameId];
    if (
      state.game.currentGame === gameId &&
      game &&
      game.turn === 1 &&
      (game as Game).moves?.length === turnNumber &&
      !game.gameOver
    ) {
      dispatch(toggleNudgeButton(true));
    }
  };

export const nudgeGameById =
  (id: string): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const turnNumber = (state.gamelist.games[id] as Game | undefined)?.moves
      .length;
    if (turnNumber === undefined) {
      throw new Error("Game not found");
    }
    try {
      await Api.post(getApiUrl("/game", id, "/nudge"));
      setTimeout(() => {
        dispatch(maybeShowNudge(id, turnNumber));
      }, 2500);
    } catch (e) {
      throw e.response?.data ?? e.toString();
    }
  };
