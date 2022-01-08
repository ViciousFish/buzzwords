import * as R from "ramda";

import { AppThunk } from "../../app/store";
import { refreshReceived, updateGame } from "./gamelistSlice";
import Game from "buzzwords-shared/Game";
import { User } from "../user/userSlice";
import { getAllUsers } from "../user/userSelectors";
import { fetchOpponent } from "../user/userActions";
import axios from "axios";
import { getApiUrl } from "../../app/apiPrefix";

export const refresh = (): AppThunk => async (dispatch, getState) => {
  console.log("refresh");
  const games = await axios.get<Game[]>(getApiUrl("/games"));
  const gamesById: { [id: string]: Game } = games.data.reduce((acc, game) => {
    acc[game.id] = {
      ...game,
      grid: game.grid,
    } as Game;
    return acc;
  }, {});

  const allKnownPlayersWithNicknames = R.pipe(
    R.filter((player: User) => Boolean(player.nickname)),
    R.keys
  )(getAllUsers(getState()));

  // @ts-ignore
  const allGamePlayers: string[] = R.pipe(
    R.map<{ [id: string]: Game }, Game>(R.prop("users")),
    R.values,
    R.flatten
    // @ts-ignore
  )(gamesById);

  const missingPlayers = R.difference(
    allGamePlayers,
    allKnownPlayersWithNicknames
  );
  if (missingPlayers.length) {
    missingPlayers.forEach((missingPlayer) => {
      dispatch(fetchOpponent(missingPlayer));
    });
  }

  dispatch(refreshReceived(gamesById));
};

export const receiveGameUpdatedSocket =
  (game: Game): AppThunk =>
  (dispatch, getState) => {
    const allKnownPlayersWithNicknames = R.pipe(
      R.filter((player: User) => Boolean(player.nickname)),
      R.keys
    )(getAllUsers(getState()));
    const missingPlayers = R.difference(
      game.users,
      allKnownPlayersWithNicknames
    );
    if (missingPlayers.length) {
      missingPlayers.forEach((missingPlayer) => {
        dispatch(fetchOpponent(missingPlayer));
      });
    }
    dispatch(
      updateGame({
        ...game,
        grid: game.grid,
      })
    );
  };

export const createNewGame = (): AppThunk => async (dispatch) => {
  const res = await axios.post(getApiUrl("/game"));

  await dispatch(refresh());
  return res.data;
};

export const joinGameById =
  (id: string): AppThunk =>
  async (dispatch) => {
    try {
      const res = await axios.post(getApiUrl("/game", id, "join"));
      if (res.data === "Not Found") {
        return false;
      }
      dispatch(refresh());
      return true;
    } catch (e) {
      console.log("caught", e);
      return false;
    }
  };
