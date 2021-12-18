import { AppDispatch, AppThunk } from "../../app/store";
import { Game } from "../game/game";
import { HexGrid } from "../hexGrid/hexGrid";
import { refreshReceived } from "./gamelist-slice";

export interface ApiGame {
  gameOver: boolean;
  grid: {
    cellMap: HexGrid
  };
  id: string;
  turn: number;
  users: string[];
  winner: unknown; // todo: fix
}

export const refresh = (): AppThunk => async (dispatch) => {
  const games: ApiGame[] = await fetch("/api/games").then((response) =>
    response.json()
  );
  const gamesById: { [id: string]: Game } = games.reduce((acc, game) => {
    console.log("game", game);
    acc[game.id] = {
      ...game,
      grid: game.grid.cellMap
    };
    return acc;
  }, {});

  dispatch(refreshReceived(gamesById));
};

export const createNewGame = (): AppThunk => async (dispatch) => {
  const res = await fetch("/api/game", {
    method: "POST",
  }).then((response) => response.text());
  console.log(res);

  dispatch(refresh());
};
