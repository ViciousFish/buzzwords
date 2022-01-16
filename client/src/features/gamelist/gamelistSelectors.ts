import * as R from "ramda";
import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { ClientGame } from "./gamelistSlice";

const getAllGames = (state: RootState) => state.gamelist.games;

export const getUnseenMoveCount = createSelector(getAllGames, (games) => {
  const unseenCount = R.pipe(
    R.values,
    R.map((game: ClientGame) => {
      if (game.lastSeenTurn === 9999) {
        return 0;
      }
      return game.moves.length - game.lastSeenTurn;
    }),
    R.sum
  )(games);
  return unseenCount;
});

export const getHowManyGamesAreMyTurn = createSelector(
  getAllGames,
  (state: RootState) => state.user.user,
  (games, user) => {
    if (!user) {
      return 0;
    }
    const currentTurns = R.pipe(
      R.values,
      R.map((game: ClientGame) => {
        const userIndex = game.users.findIndex((val) => val === user.id);
        if (game.users.length < 2 || game.gameOver) {
          return 0;
        }
        return game.turn === userIndex ? 1 : 0;
      }),
      R.sum
    )(games);
    return currentTurns;
  }
);
