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

export const getOpponent = createSelector(
  [
    (state: RootState) => state.user.opponents,
    (state: RootState) => state.gamelist.games,
    (state: RootState) => state.user.user,
    (_state, gameId: string) => gameId,
  ],
  (opponentUsers, allGames, selfUser, gameId) => {
    const game = allGames[gameId];
    if (!game || !selfUser) {
      return null;
    }
    const gameOpponent = game.users.filter(
      (gameUser) => gameUser !== selfUser.id
    )[0];
    const opponent = opponentUsers[gameOpponent];
    if (!opponent) {
      return { id: gameOpponent };
    }
    return opponent;
  }
);

export const isUserLoggedIn = createSelector(
  (state: RootState) => state.user.user,
  (self) => {
    return self ? Boolean(self.googleId) : null;
  }
);
