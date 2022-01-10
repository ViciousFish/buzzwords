import * as R from "ramda";

import { AppThunk, RootState } from "../../app/store";
import {
  ClientGame,
  refreshReceived,
  shiftGameStateModalQueueForGame,
  updateGame,
} from "./gamelistSlice";
import Game from "buzzwords-shared/Game";
import { opponentReceived, User } from "../user/userSlice";
import { getAllUsers } from "../user/userSelectors";
import { fetchOpponent } from "../user/userActions";
import axios from "axios";
import { getApiUrl } from "../../app/apiPrefix";
import { GameStateModalType } from "../game/GameStateModal";
import { setGameStateModal } from "../game/gameSlice";

interface GameMetaCache {
  lastSeenTurns: {
    [gameId: string]: number;
  };
}

const getLastSeenTurns = () => {
  const metaJSON = localStorage.getItem("gameMetaCache");
  const metaCache = metaJSON ? (JSON.parse(metaJSON) as GameMetaCache) : null;
  return metaCache?.lastSeenTurns;
};

const updateLastSeenTurns = (gameId: string, turns: number) => {
  const lastSeenTurns = getLastSeenTurns() ?? {};
  lastSeenTurns[gameId] = turns;
  const metaCache = JSON.stringify({
    lastSeenTurns,
  });
  localStorage.setItem("gameMetaCache", metaCache);
};

const gameUpdateEventGetGameStateModalType = (
  game: Game,
  state: RootState
): GameStateModalType | null => {
  let gameStateModalType: GameStateModalType | null = null;
  if (game.moves.length === 0) {
    return null;
  }
  if (game.moves[game.moves.length - 1].player === game.turn) {
    gameStateModalType = game.turn === 0 ? "extra-turn-p1" : "extra-turn-p2";
  }
  if (game.gameOver) {
    const selfUser = state.user.user?.id;
    const userIndex = game.users.findIndex((userId) => selfUser === userId);
    if (userIndex > -1) {
      gameStateModalType = game.winner === userIndex ? "victory" : "defeat";
    }
  }
  return gameStateModalType;
};

export const refresh = (): AppThunk => async (dispatch, getState) => {
  const response = await axios.get<{
    games: Game[];
    users: User[];
  }>(getApiUrl("/games"));

  const lastSeenTurns = getLastSeenTurns();

  const gamesById: { [id: string]: ClientGame } = {};
  response.data.games.forEach((game) => {
    gamesById[game.id] = {
      ...game,
      lastSeenTurn: lastSeenTurns?.[game.id] ?? game.moves.length,
      queuedGameStateModals: [],
    };
  }, {});

  Object.values(response.data.users).forEach((u) =>
    dispatch(opponentReceived(u))
  );
  dispatch(refreshReceived(gamesById));
};

export const receiveGameUpdatedSocket =
  (game: Game): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const allKnownPlayersWithNicknames = R.pipe(
      R.filter((player: User) => Boolean(player.nickname)),
      R.keys
    )(getAllUsers(state));
    const missingPlayers = R.difference(
      game.users,
      allKnownPlayersWithNicknames
    );
    if (missingPlayers.length) {
      missingPlayers.forEach((missingPlayer) => {
        dispatch(fetchOpponent(missingPlayer));
      });
    }

    const gameStateModalType = game
      ? gameUpdateEventGetGameStateModalType(game, state)
      : null;
    if (state.game.currentGame === game.id && state.game.windowHasFocus) {
      updateLastSeenTurns(game.id, game.moves.length);
      // CQ: set game state modal
      if (gameStateModalType) {
        dispatch(
          setGameStateModal({
            type: gameStateModalType,
            p1Nick: state.user.opponents[game.users[0]]?.nickname ?? "Pink",
            p2Nick: state.user.opponents[game.users[1]]?.nickname ?? "Green",
          })
        );
      }
      return dispatch(
        updateGame({
          game,
          lastSeenTurn: game.moves.length,
          gameStateModalToQueue: null,
        })
      );
    }

    let lastSeenTurn = getLastSeenTurns()?.[game.id] ?? 0;
    lastSeenTurn = lastSeenTurn === 9999 ? game.moves.length : lastSeenTurn;
    dispatch(
      updateGame({
        game,
        lastSeenTurn,
        gameStateModalToQueue: gameStateModalType,
      })
    );
  };

export const dequeueOrDismissGameStateModalForGame =
  (gameId: string): AppThunk =>
  (dispatch, getState) => {
    dispatch(setGameStateModal(null));
    const state = getState();
    const game = state.gamelist.games[gameId];
    const gameStateModalToShow = game?.queuedGameStateModals[0];
    if (gameStateModalToShow) {
      dispatch(shiftGameStateModalQueueForGame(gameId));
      dispatch(
        setGameStateModal({
          type: gameStateModalToShow,
          p1Nick: state.user.opponents[game?.users[0]]?.nickname ?? "Pink",
          p2Nick: state.user.opponents[game?.users[1]]?.nickname ?? "Green",
        })
      );
    }
  };

export const markGameAsSeen =
  (gameId: string): AppThunk =>
  (dispatch, getState) => {
    const game = getState().gamelist.games[gameId];
    if (!game) {
      console.log("inf", gameId);
      updateLastSeenTurns(gameId, 9999);
      return;
    }
    const lastSeenTurn = game.moves.length;
    updateLastSeenTurns(gameId, lastSeenTurn);
    dispatch(
      updateGame({
        game,
        lastSeenTurn,
        gameStateModalToQueue: null,
      })
    );
    dispatch(dequeueOrDismissGameStateModalForGame(gameId));
  };

export const createNewGame = (): AppThunk => async (dispatch) => {
  const res = await axios.post(getApiUrl("/game"));

  await dispatch(refresh());
  return res.data;
};

export const createNewAIGame = (): AppThunk => async (dispatch) => {
  const res = await axios.post(getApiUrl("/game"), {
    vsAI: true,
    difficulty: 5,
  });

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
