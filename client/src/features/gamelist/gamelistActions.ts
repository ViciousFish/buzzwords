// CQx: took main, check
import * as R from "ramda";
import { toast } from "react-toastify";

import { AppThunk, RootState } from "../../app/store";
import {
  deleteGame,
  refreshReceived,
  setGameLoading,
  setIsRefreshing,
  setShowTutorialCard,
  shiftGameStateModalQueueForGame,
  updateGame,
} from "./gamelistSlice";
import Game, { ShallowGame } from "buzzwords-shared/Game";
import { opponentReceived, User } from "../user/userSlice";
import { getAllUsers } from "../user/userSelectors";
import { fetchOpponent } from "../user/userActions";
import { getApiUrl } from "../../app/apiPrefix";
import { GameStateModalType } from "../game/GameStateModal";
import {
  resetSelection,
  setGameStateModal,
  toggleNudgeButton,
} from "../game/gameSlice";
import { initiateReplay, maybeShowNudge } from "../game/gameActions";
import { initializeLocalBotGame } from "../bgio-board/localBotSlice";
import { tutorialInitialBoard } from "buzzwords-shared/Tutorial";
import { makeHexGrid, getCellNeighbors, setCell, getNewCellValues } from "buzzwords-shared/hexgrid";
import { WordsObject } from "../../../../server/src/words";

import chord from "../../assets/ding.mp3?url";
import { batch } from "react-redux";
import { Api } from "../../app/Api";
import { AxiosError } from "axios";

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
  dispatch(setIsRefreshing(true));
  try {
    const response = await Api.get<{
      games: ShallowGame[];
      users: User[];
    }>(getApiUrl("/game"));

    const gamesById: { [id: string]: ShallowGame } = {};
    response.data.games.forEach((game) => {
      gamesById[game.id] = game;
    }, {});

    Object.values(response.data.users).forEach((u) =>
      dispatch(opponentReceived(u))
    );
    dispatch(refreshReceived(gamesById));
  } catch (e) {
    toast(e.response?.data?.message ?? e.toString(), { type: "error" });
  }
};

const DingAudio = new Audio(chord);

export const receiveGameUpdatedSocket =
  (game: Game): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const userIndex = game.users.findIndex(
      (user) => user === state.user.user?.id
    );

    const allKnownPlayersWithNicknames = R.pipe(
      R.filter((player: User) => Boolean(player.nickname)),
      R.keys
    )(getAllUsers(state));
    const missingPlayers = R.difference(
      game.users,
      allKnownPlayersWithNicknames
    );
    let opponentNamesPromise = Promise.resolve([] as void[]);
    if (missingPlayers.length) {
      opponentNamesPromise = Promise.all(
        missingPlayers.map((missingPlayer) =>
          dispatch(fetchOpponent(missingPlayer))
        )
      );
    }

    if (userIndex === game.turn && !game.vsAI && !game.gameOver) {
      await opponentNamesPromise;
      if (!state.settings.turnNotificationsMuted) {
        // DingAudio.play();
      }
      const opponentNick =
        getAllUsers(getState())[game.users[1 - userIndex]]?.nickname ??
        "Your opponent";
      const word = game.moves[game.moves.length - 1]?.letters.join("");
      let title = "Buzzwords: it's your turn";
      let body = "";
      if (!word) {
        body = `${opponentNick} accepted your challenge`;
      } else {
        body = `${opponentNick} played ${word.toUpperCase()}`;
      }
      if (!state.game.windowHasFocus) {
        new Notification(title, {
          body: body,
          image: "/apple-touch-icon.png",
          silent: true,
        }).onclick = () => console.log("clicked", game.id);
      } else if (state.game.currentGame !== game.id) {
        toast(body);
      }
    }

    if (game.vsAI && game.turn === 1) {
      const { id, moves } = game;
      const turnNumber = moves.length;
      setTimeout(() => {
        dispatch(maybeShowNudge(id, turnNumber));
      }, 20000);
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
      batch(() => {
        dispatch(
          updateGame({
            game,
            gameStateModalToQueue: null,
          })
        );
        if (game.vsAI && game.moves[game.moves.length - 1].player === 1) {
          dispatch(initiateReplay(game.moves.length - 1, true));
        }
      });
      if (gameStateModalType) {
        dispatch(
          setGameStateModal({
            type: gameStateModalType,
          })
        );
      }
      return;
    }

    dispatch(
      updateGame({
        game,
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
    const gameStateModalToShow =
      state.gamelist.gameMetas[gameId]?.queuedGameStateModals[0];
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
    dispatch(dequeueOrDismissGameStateModalForGame(gameId));
  };

export type CreateGameType =
  | "offline-bot"
  | "online-pvp"
  | "online-bot"
  | "hotseat"
  | "tutorial";
interface CreateHumanGameParams {
  type: "online-pvp" | "hotseat";
}

export interface CreateBotGameParams {
  type: "offline-bot" | "online-bot";
  difficulty: number;
}

export type CreateGameParams = {
  type: CreateGameType;
  difficulty?: number;
};

export const createGame =
  (params: CreateGameParams): AppThunk<string> =>
  async (dispatch, getState): Promise<string> => {
    switch (params.type) {
      case "tutorial": {
        // Create tutorial game with tutorial board
        dispatch(initializeLocalBotGame({
          grid: tutorialInitialBoard,
          difficulty: 3,
          isTutorial: true,
        }));
        // Get the gameId from state after dispatch
        const state = getState();
        return state.localBot.mostRecentGameId!;
      }
      case "offline-bot": {
        // Create local bot game with regular grid
        const grid = makeHexGrid();
        const neighbors = [
          ...getCellNeighbors(grid, -2, -1),
          ...getCellNeighbors(grid, 2, 1),
        ];
        const newValues = getNewCellValues([], 12, WordsObject);
        let i = 0;
        for (const cell of neighbors) {
          cell.value = newValues[i];
          i++;
          setCell(grid, cell);
        }
        grid["-2,-1"].capital = true;
        grid["-2,-1"].owner = 0;
        grid["2,1"].capital = true;
        grid["2,1"].owner = 1;

        dispatch(initializeLocalBotGame({
          grid,
          difficulty: (params as CreateBotGameParams).difficulty ?? 5,
          isTutorial: false,
        }));
        // Get the gameId from state after dispatch
        const state = getState();
        return state.localBot.mostRecentGameId!;
      }
      case "hotseat":
        return "";
      case "online-bot":
        try {
          const res = await Api.post<string>(getApiUrl("/game"), {
            vsAI: true,
            difficulty: (params as CreateBotGameParams).difficulty,
          });
          await dispatch(fetchGameById(res.data));
          return res.data;
        } catch (e) {
          // CQx: come back to this
          if (e.response?.data?.message) {
            toast(e.response.data.message);
          }
          throw e.response?.data ?? (e as AxiosError).message;
        }
      case "online-pvp":
        try {
          const res = await Api.post<string>(getApiUrl("/game"));
          await dispatch(fetchGameById(res.data));
          return res.data;
        } catch (e) {
          if (e.response?.data?.message) {
            toast(e.response.data.message);
          }
          throw e.response?.data ?? e.message;
        }
      default:
        throw "createGame default case reached";
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
      toast(e.response?.data ?? e.toString(), { type: "error" });
      return false;
    }
  };

export const deleteGameById =
  (id: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      await Api.post(getApiUrl("/game", id, "delete"));
      dispatch(deleteGame(id));
    } catch (e) {
      toast(e.response?.data ?? e, { type: "error" });
    }
  };

export const fetchGameById =
  (id: string): AppThunk<Promise<boolean>> =>
  async (dispatch) => {
    dispatch(setGameLoading({ id, loading: "loading" }));
    try {
      const { data } = await Api.get<Game>(getApiUrl("/game", id));
      dispatch(
        updateGame({
          game: data,
          gameStateModalToQueue: null,
        })
      );
    } catch (e) {
      if (e.response?.status === 404) {
        dispatch(
          setGameLoading({
            id,
            loading: "loaded",
          })
        );
        return false;
      }
      toast(e.response?.data ?? e, { type: "error" });
      return false; // this is a bug. it will result in showing a 404 page when the request fails due to network errors. I don't care
    }
    dispatch(
      setGameLoading({
        id,
        loading: "loaded",
      })
    );
    return true;
  };

export const refreshActiveGames =
  (): AppThunk => async (dispatch, getState) => {
    dispatch(setIsRefreshing(true));
    const state = getState();
    const activeGames = Object.values(state.gamelist.games).filter(
      (game) => !game.gameOver
    );

    await Promise.all(
      activeGames.map((game) => dispatch(fetchGameById(game.id)))
    );
    dispatch(setIsRefreshing(false));
  };

export const forfeitGame =
  (id: string): AppThunk =>
  async (dispatch) => {
    const { data } = await Api.post<Game>(getApiUrl("/game", id, "forfeit"));
  };

export const getHasDismissedTutorialCard = (): boolean =>
  JSON.parse(localStorage.getItem("dismissedTutorialCard") ?? "false");
export const dismissTutorialCard = (): AppThunk => (dispatch) => {
  localStorage.setItem("dismissedTutorialCard", "true");
  dispatch(setShowTutorialCard(false));
};
