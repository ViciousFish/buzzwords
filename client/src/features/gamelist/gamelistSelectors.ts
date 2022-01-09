import * as R from "ramda";
import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { ClientGame } from "./gamelistSlice";

const getAllGames = (state: RootState) => state.gamelist.games;

export const getHasUnseenMove = createSelector(getAllGames, (games) => {
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
  return Boolean(unseenCount);
});
