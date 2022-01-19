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
import {
  resetSelection,
  setFreezeGameBoard,
  setGameStateModal,
  toggleNudgeButton,
} from "../game/gameSlice";
import { initiateReplay, maybeShowNudge } from "../game/gameActions";

import ding from "../../../assets/ding.mp3?url";
import { batch } from "react-redux";
import { Api } from "../../app/Api";

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
  const response = await Api.get<{
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

const DingAudio = new Audio(ding);

export const receiveGameUpdatedSocket =
  (game: Game): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const userIndex = game.users.findIndex(
      (user) => user === state.user.user?.id
    );
    if (
      userIndex === game.turn &&
      !game.gameOver &&
      !state.game.turnNotificationsMuted
    ) {
      DingAudio.play();
    }

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

    if (game.vsAI && game.turn === 1) {
      const { id, moves } = game;
      const turnNumber = moves.length;
      setTimeout(() => {
        dispatch(maybeShowNudge(id, turnNumber));
      }, 10000);
    }
    if (game.vsAI && game.turn === 0) {
      dispatch(toggleNudgeButton(false));
    }

    const gameStateModalType = game
      ? gameUpdateEventGetGameStateModalType(game, state)
      : null;
    if (state.game.currentGame === game.id) {
      dispatch(resetSelection());
    }
    if (state.game.currentGame === game.id && state.game.windowHasFocus) {
      updateLastSeenTurns(game.id, game.moves.length);
      batch(() => {
        dispatch(
          updateGame({
            game,
            lastSeenTurn: game.moves.length,
            gameStateModalToQueue: null,
          })
        );
        if (game.vsAI && game.moves[game.moves.length - 1].player === 1) {
          dispatch(initiateReplay(game.moves.length - 1, true))
        }
      });
      if (gameStateModalType) {
        dispatch(
          setGameStateModal({
            type: gameStateModalType,
          })
        );
      }
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
        })
      );
    }
  };

export const markGameAsSeen =
  (gameId: string): AppThunk =>
  async (dispatch, getState) => {
    const game = getState().gamelist.games[gameId];
    if (!game) {
      console.log("attempted to mark null game as seen", gameId);
      updateLastSeenTurns(gameId, 9999);
      return;
    }
    let lastSeenTurn =
      game.lastSeenTurn === 9999 ? game.moves.length : game.lastSeenTurn;
    while (lastSeenTurn < game.moves.length) {
      await dispatch(initiateReplay(lastSeenTurn));
      lastSeenTurn++;
    }
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
  try {
    const res = await Api.post<string>(getApiUrl("/game"));
    await dispatch(refresh());
    return res.data;
  } catch (e) {
    throw e.response?.data ?? e.toString();
  }
};

export const createNewAIGame =
  (difficulty: number): AppThunk =>
  async (dispatch) => {
    try {
      const res = await Api.post<string>(getApiUrl("/game"), {
        vsAI: true,
        difficulty,
      });
      await dispatch(refresh());
      return res.data;
    } catch (e) {
      throw e.response?.data ?? e.toString();
    }
  };

export const joinGameById =
  (id: string): AppThunk<Promise<boolean>> =>
  async (dispatch) => {
    try {
      const res = await Api.post(getApiUrl("/game", id, "join"));
      if (res.data === "Not Found") {
        return false;
      }
      dispatch(refresh());
      return true;
    } catch (e) {
      // throw e.response?.data ?? e.toString();
      return false;
    }
  };

export const getTutorialCardSetting = () =>
  JSON.parse(
    localStorage.getItem("turnNotificationsMute") || "false"
  ) as boolean;

export const setTutorialCardSetting = (mute: boolean) =>
  localStorage.setItem("turnNotificationsMute", JSON.stringify(mute));
