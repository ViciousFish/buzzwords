import { Middleware } from "@reduxjs/toolkit";
import { LocalBotState } from "./localBotSlice";
import { executeBotMove } from "./localBotThunks";
import { setBotMoveInProgress } from "./localBotSlice";
import { loadLocalBotGame, playWordSuccess, pass } from "./localBotSlice";

export const localBotMiddleware: Middleware<
  {},
  { localBot: LocalBotState }
> = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  // Type assertion needed because middleware dispatch doesn't know about thunks
  const dispatch = store.dispatch as typeof store.dispatch & {
    <T extends any>(thunk: T): T extends (...args: any[]) => infer R ? R : never;
  };

  // Check if we should trigger a bot move after certain actions
  const checkAndTriggerBotMove = (gameId: string) => {
    const game = state.localBot.games[gameId];
    const botMoveInProgress = state.localBot.botMoveInProgress[gameId] || false;

    if (
      game &&
      game.currentPlayer === 1 &&
      !game.gameover &&
      !botMoveInProgress
    ) {
      console.log("[localBotMiddleware] Triggering bot move after action", {
        actionType: action.type,
        gameId,
      });
      // Don't set the flag here - let executeBotMove set it to avoid race conditions
      dispatch(executeBotMove({ gameId }))
        .unwrap()
        .catch((error) => {
          console.error("[localBotMiddleware] Bot move failed:", error);
          dispatch(setBotMoveInProgress({ gameId, inProgress: false }));
        });
    }
  };

  // Trigger bot move after loading a game (deserialization)
  if (loadLocalBotGame.match(action)) {
    // Wait a tick to ensure state is updated after the action
    setTimeout(() => {
      checkAndTriggerBotMove(action.payload);
    }, 0);
  }

  // Trigger bot move after a player move completes (if it's now bot's turn)
  if (playWordSuccess.match(action)) {
    const gameId = action.payload.gameId;
    // Wait a tick to ensure state is updated
    setTimeout(() => {
      checkAndTriggerBotMove(gameId);
    }, 0);
  }

  // Trigger bot move after a pass (if it's now bot's turn)
  if (pass.match(action)) {
    const gameId = action.payload.gameId;
    // Wait a tick to ensure state is updated
    setTimeout(() => {
      checkAndTriggerBotMove(gameId);
    }, 0);
  }

  // Also check all games after store initialization (when games are loaded from localStorage)
  // This handles the case where the app loads with games already in state
  // Only check on the very first action (store initialization)
  if (action.type === "@@redux/INIT") {
    setTimeout(() => {
      const currentState = store.getState();
      // Check all games to see if any need bot moves
      Object.keys(currentState.localBot.games).forEach((gameId) => {
        const game = currentState.localBot.games[gameId];
        const botMoveInProgress = currentState.localBot.botMoveInProgress[gameId] || false;
        
        if (
          game &&
          game.currentPlayer === 1 &&
          !game.gameover &&
          !botMoveInProgress
        ) {
          console.log("[localBotMiddleware] Triggering bot move on app initialization", {
            gameId,
          });
          // Don't set the flag here - let executeBotMove set it to avoid race conditions
          dispatch(executeBotMove({ gameId }))
            .unwrap()
            .catch((error) => {
              console.error("[localBotMiddleware] Bot move failed:", error);
              dispatch(setBotMoveInProgress({ gameId, inProgress: false }));
            });
        }
      });
    }, 100); // Small delay to ensure store is fully initialized
  }

  return result;
};

