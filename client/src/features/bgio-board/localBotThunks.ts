import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../app/store";
import { playWordSuccess, initializeLocalBotGame, setBotMoveInProgress, updateSelection, pass } from "./localBotSlice";
import { processPlayWord } from "./localBotGameLogic";
import { HexCoord } from "buzzwords-shared/types";
import { INVALID_MOVE } from "boardgame.io/core";
import { tutorialInitialBoard } from "buzzwords-shared/Tutorial";
import { getBotMoveForGame } from "./localBot";

export const playWord = createAsyncThunk<
  void,
  { gameId: string; move: HexCoord[] },
  { state: RootState; dispatch: AppDispatch }
>("localBot/playWord", async ({ gameId, move }, { getState, dispatch }) => {
  const state = getState();
  const game = state.localBot.games[gameId];
  
  if (!game) {
    throw new Error(`Game ${gameId} not found`);
  }

  if (game.gameover) {
    return;
  }

  const result = processPlayWord(game, move);
  
  if (result === INVALID_MOVE) {
    throw new Error("Invalid move");
  }

  dispatch(
    playWordSuccess({
      gameId,
      grid: result.grid,
      currentPlayer: result.currentPlayer,
      turn: result.turn,
      gameover: result.gameover,
      winner: result.winner,
      move: result.move,
      capitalCaptured: result.capitalCaptured,
    })
  );
  
  // Clear bot move in progress flag after move completes
  // (playWordSuccess reducer also clears it, but this ensures it's cleared even if called directly)
  dispatch(setBotMoveInProgress({ gameId, inProgress: false }));
});

export const initializeFirstTutorialIfNeeded = createAsyncThunk<
  void,
  void,
  { state: RootState; dispatch: AppDispatch }
>("localBot/initializeFirstTutorialIfNeeded", async (_, { getState, dispatch }) => {
  const state = getState();
  const games = state.localBot.games;
  
  // Check if any tutorial game already exists
  const hasTutorial = Object.values(games).some((game) => game.isTutorial);
  
  if (hasTutorial) {
    // Tutorial already exists, bail early
    return;
  }
  
  // No tutorial exists, create one
  dispatch(
    initializeLocalBotGame({
      grid: tutorialInitialBoard,
      difficulty: 3,
      isTutorial: true,
    })
  );
});

export const executeBotMove = createAsyncThunk<
  void,
  { gameId: string },
  { state: RootState; dispatch: AppDispatch }
>("localBot/executeBotMove", async ({ gameId }, { getState, dispatch }) => {
  const state = getState();
  const game = state.localBot.games[gameId];
  const botMoveInProgress = state.localBot.botMoveInProgress[gameId] || false;
  
  // Defensive check: if a bot move is already in progress, don't start another one
  // This prevents duplicate bot moves from being triggered
  if (botMoveInProgress) {
    console.log("[executeBotMove] Bot move already in progress, skipping", { gameId });
    return;
  }
  
  if (!game || game.currentPlayer !== 1 || game.gameover) {
    dispatch(setBotMoveInProgress({ gameId, inProgress: false }));
    return;
  }
  
  // Set the flag at the start to prevent duplicate execution
  dispatch(setBotMoveInProgress({ gameId, inProgress: true }));

  // Clear any stale selection
  if (game.selection.length > 0) {
    dispatch(updateSelection({ gameId, selection: [] }));
  }

  // Get bot move after thinking delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // Re-check game state after delay
  const currentState = getState();
  const currentGame = currentState.localBot.games[gameId];
  
  if (!currentGame || currentGame.currentPlayer !== 1 || currentGame.gameover) {
    dispatch(setBotMoveInProgress({ gameId, inProgress: false }));
    return;
  }

  const botMove = getBotMoveForGame(currentGame);
  
  if (botMove) {
    // Queue up all selection updates in advance
    let delay = 0;
    botMove.forEach((_, index) => {
      setTimeout(() => {
        dispatch(
          updateSelection({
            gameId,
            selection: botMove.slice(0, index + 1),
          })
        );
      }, delay);
      delay += 500; // Add 500ms for each update
    });

    // After all updates are queued, wait a bit and submit the move
    setTimeout(() => {
      dispatch(playWord({ gameId, move: botMove }));
    }, delay + 1000);
  } else {
    // Bot can't find a move, pass
    dispatch(pass({ gameId }));
    dispatch(setBotMoveInProgress({ gameId, inProgress: false }));
  }
});

