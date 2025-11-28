import { Middleware } from "@reduxjs/toolkit";
import { LocalBotState } from "./localBotSlice";

const STORAGE_KEY = "buzzwords-local-bot-games";
const CURRENT_GAME_KEY = "buzzwords-local-bot-current-game";

// Helper to ensure move dates are strings (for Redux serializability)
function normalizeMoveDates(moves: any[]): any[] {
  if (!Array.isArray(moves)) return [];
  return moves.map((move) => {
    if (move && typeof move.date !== "string" && move.date) {
      // Convert Date object or other format to ISO string
      return {
        ...move,
        date: move.date instanceof Date ? move.date.toISOString() : new Date(move.date).toISOString(),
      };
    }
    return move;
  });
}

export function loadAllLocalBotGames(): { [gameId: string]: any } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const games: unknown = JSON.parse(stored);
      // Type guard: ensure games is an object
      if (!games || typeof games !== "object" || Array.isArray(games)) {
        return {};
      }
      // Normalize dates in all moves for all games
      const normalizedGames: { [gameId: string]: any } = {};
      for (const [gameId, game] of Object.entries(games)) {
        if (game && typeof game === "object") {
          const normalizedGame = { ...game };
          if (Array.isArray((game as any).moves)) {
            normalizedGame.moves = normalizeMoveDates((game as any).moves);
          }
          normalizedGames[gameId] = normalizedGame;
        } else {
          normalizedGames[gameId] = game;
        }
      }
      return normalizedGames;
    }
  } catch (e) {
    console.error("Failed to load local bot games from localStorage:", e);
  }
  return {};
}

export function loadCurrentLocalBotGameId(): string | null {
  try {
    const stored = localStorage.getItem(CURRENT_GAME_KEY);
    if (stored) {
      return stored;
    }
  } catch (e) {
    console.error("Failed to load current local bot game ID from localStorage:", e);
  }
  return null;
}

export function saveLocalBotGames(games: { [gameId: string]: any }): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  } catch (e) {
    console.error("Failed to save local bot games to localStorage:", e);
  }
}

export function saveCurrentLocalBotGameId(gameId: string | null): void {
  try {
    if (gameId) {
      localStorage.setItem(CURRENT_GAME_KEY, gameId);
    } else {
      localStorage.removeItem(CURRENT_GAME_KEY);
    }
  } catch (e) {
    console.error("Failed to save current local bot game ID to localStorage:", e);
  }
}

export function deleteLocalBotGame(gameId: string): void {
  try {
    const games = loadAllLocalBotGames();
    delete games[gameId];
    saveLocalBotGames(games);
    // If we're deleting the current game, clear the current game ID
    if (loadCurrentLocalBotGameId() === gameId) {
      saveCurrentLocalBotGameId(null);
    }
  } catch (e) {
    console.error("Failed to delete local bot game from localStorage:", e);
  }
}

export const localBotPersistenceMiddleware: Middleware<{}, { localBot: LocalBotState }> =
  (store) => (next) => (action) => {
    const result = next(action);
    
    // Save local bot games and current game ID to localStorage after any local bot action
    if (action.type?.startsWith("localBot/")) {
      const state = store.getState();
      if (state.localBot) {
        saveLocalBotGames(state.localBot.games);
        saveCurrentLocalBotGameId(state.localBot.mostRecentGameId);
      }
    }
    
    return result;
  };

