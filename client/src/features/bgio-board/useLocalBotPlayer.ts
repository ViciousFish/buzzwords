import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setBotMoveInProgress } from "./localBotSlice";
import { executeBotMove } from "./localBotThunks";

export function useLocalBotPlayer(gameId: string) {
  const dispatch = useAppDispatch();
  const game = useAppSelector((state) => state.localBot.games[gameId]);
  const botMoveInProgress = useAppSelector(
    (state) => state.localBot.botMoveInProgress[gameId] || false
  );

  // Bot move logic
  useEffect(() => {
    console.log("[useLocalBotPlayer] Effect triggered", {
      gameId,
      hasGame: !!game,
      currentPlayer: game?.currentPlayer,
      gameover: game?.gameover,
      botMoveInProgress,
      selectionLength: game?.selection?.length,
    });

    if (
      !game ||
      game.currentPlayer !== 1 ||
      game.gameover ||
      botMoveInProgress
    ) {
      console.log("[useLocalBotPlayer] Early return", {
        noGame: !game,
        notBotTurn: game?.currentPlayer !== 1,
        gameover: game?.gameover,
        alreadyMoving: botMoveInProgress,
      });
      // If it's not the bot's turn, clear the in-progress flag
      // This handles the case where the page was reloaded mid-bot-move
      if (game && game.currentPlayer !== 1 && botMoveInProgress) {
        console.log("[useLocalBotPlayer] Clearing botMoveInProgress because not bot's turn");
        dispatch(setBotMoveInProgress({ gameId, inProgress: false }));
      }
      return;
    }

    console.log("[useLocalBotPlayer] Starting bot move", {
      gameId,
      turn: game.turn,
      selectionLength: game.selection.length,
    });

    // Set the in-progress flag and dispatch the bot move thunk
    dispatch(setBotMoveInProgress({ gameId, inProgress: true }));
    dispatch(executeBotMove({ gameId })).catch((error) => {
      console.error("[useLocalBotPlayer] Bot move failed:", error);
      dispatch(setBotMoveInProgress({ gameId, inProgress: false }));
    });
  }, [
    game?.currentPlayer,
    game?.gameover,
    gameId,
    dispatch,
    botMoveInProgress,
    game,
  ]);
}
