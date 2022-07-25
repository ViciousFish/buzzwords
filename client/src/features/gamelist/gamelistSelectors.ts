import * as R from "ramda";
import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import Game, { ShallowGame } from "buzzwords-shared/Game";
import { User } from "../user/userSlice";

const getAllGames = (state: RootState) => state.gamelist.games;

export const getHowManyGamesAreMyTurn = createSelector(
  getAllGames,
  (state: RootState) => state.user.user,
  (_, currentGame: string | null) => currentGame,
  (games, user: User, currentGame: string | null) => {
    if (!user) {
      return 0;
    }
    const currentTurns = R.pipe(
      R.values,
      R.map((game: Game | ShallowGame) => {
        const userIndex = game.users.findIndex((val) => val === user.id);
        if (game.id === currentGame) {
          return 0;
        }
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
