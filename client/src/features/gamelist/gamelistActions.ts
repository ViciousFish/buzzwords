import { AppDispatch, AppThunk } from "../../app/store";
import { ClientGame, refreshReceived } from "./gamelist-slice";

export const refresh = (): AppThunk => async (dispatch) => {
  const games: ClientGame[] = await fetch("/api/games").then((response) =>
    response.json()
  );
  const gamesById = games.reduce((acc, game) => {
    console.log("game", game);
    acc[game.id] = game;
    return acc;
  }, {});

  dispatch(refreshReceived(gamesById));
};

export const createNewGame = (): AppThunk => async (dispatch) => {
  fetch("/api/game", {
    method: "POST",
  })
    .then((response) => response.text())
    .then(() => {
      dispatch(refresh());
    });
};
