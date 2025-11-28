import { getBotMove } from "buzzwords-shared/bot";
import { WordsObject } from "../../../../server/src/words";
import { LocalBotGameState } from "./localBotSlice";

export function getBotMoveForGame(game: LocalBotGameState): import("buzzwords-shared/types").HexCoord[] | null {
  if (game.gameover || game.currentPlayer !== 1) {
    return null;
  }

  try {
    return getBotMove(game.grid, {
      difficulty: game.difficulty,
      words: WordsObject,
      bannedWords: {},
    });
  } catch (e) {
    // If bot can't find a move, return null (caller should handle pass)
    console.error("Bot failed to find a move:", e);
    return null;
  }
}

