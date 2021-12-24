import { AppDispatch, AppThunk } from "../../app/store";
import { Game, GamePlayer } from "../game/game";
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
  winner: GamePlayer | null;
  moves: {
    coords: {
      q: number;
      r: number;
    }[];
    letters: string[];
    player: 0 | 1;
  }[];
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
