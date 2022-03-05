import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

export const getAllUsers = createSelector(
  (state: RootState) => state.user.opponents,
  (state: RootState) => state.user.user,
  (opponents, selfUser) => {
    const allUsers = {
      ...opponents,
    };
    if (selfUser) {
      allUsers[selfUser.id] = selfUser;
    }
    return allUsers;
  }
);

export const getOpponentName = createSelector(
  [
    (state: RootState) => state.user.opponents,
    (state: RootState) => state.gamelist.games,
    (_state, gameId: string) => gameId,
  ],
  (opponentUsers, allGames, gameId) => {
    const game = allGames[gameId];
    if (!game) {
      return null;
    }
    const opponentsArray = Object.values(opponentUsers);
    const opponent = game.users.filter(
      (user) =>
        opponentsArray.findIndex((opponent) => opponent.id === user) > -1
    )[0];
    if (!opponent) {
      return null;
    }
    return opponentUsers[opponent]?.nickname ?? null;
  }
);

export const isUserLoggedIn = createSelector(
  (state: RootState) => state.user.user,
  (self) => {
    return self ? Boolean(self.googleId) : null;
  }
);
