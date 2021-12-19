import { AppDispatch, AppThunk } from "../../app/store";
import { Game } from "../game/game";
import { HexGrid } from "../hexGrid/hexGrid";
import { refreshReceived } from "./gamelistSlice";

export interface ApiGame {
  gameOver: boolean;
  grid: {
    cellMap: HexGrid;
  };
  id: string;
  turn: number;
  users: string[];
  winner: unknown; // todo: fix
}

export const refresh = (): AppThunk => async (dispatch) => {
  console.log("refresh");
  const games: ApiGame[] = await fetch("/api/games").then((response) =>
    response.json()
  );
  const gamesById: { [id: string]: Game } = games.reduce((acc, game) => {
    acc[game.id] = {
      ...game,
      grid: game.grid.cellMap,
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

export const joinGameById =
  (id: string): AppThunk =>
  async (dispatch) => {
    const res = await fetch(`/api/game/${id}/join`, {
      method: "POST",
    }).then((response) => response.json());
    console.log("res", res);

    dispatch(refresh());
  };
