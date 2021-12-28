import { AppThunk } from "../../app/store";
import { refreshReceived } from "./gamelistSlice";
import Game from "../../../../shared/Game";

export const refresh = (): AppThunk => async (dispatch) => {
  console.log("refresh");
  const games: Game[] = await fetch("/api/games").then((response) =>
    response.json()
  );
  const gamesById: { [id: string]: Game } = games.reduce((acc, game) => {
    acc[game.id] = {
      ...game,
      grid: game.grid,
    };
    return acc;
  }, {});

  dispatch(refreshReceived(gamesById));
};

export const createNewGame = (): AppThunk => async (dispatch) => {
  const res = await fetch("/api/game", {
    method: "POST",
  }).then((response) => response.text());

  await dispatch(refresh());
  return res;
};

export const joinGameById =
  (id: string): AppThunk =>
  async (dispatch) => {
    try {
      const res = await fetch(`/api/game/${id}/join`, {
        method: "POST",
      }).then((response) => response.text());
      if (res === "Not Found") {
        return false;
      }
      dispatch(refresh());
      return true;
    } catch (e) {
      console.log("caught", e);
      return false;
    }
  };
