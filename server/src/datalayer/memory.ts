import { ulid } from "ulid";
import { getRandomCharacter, isValidWord } from "../alphaHelpers";
// import { Game,  } from "../types";
import Game from "../Game";
import GameManager from "../GameManager";
import HexGrid from "../hexgrid";
import { HexCoord } from "../types";

export default class SQLite {
  games: {
    [key: string]: Game;
  };
  constructor() {
    this.games = {};
  }

  getGamesByUserId(id: string): Game[] {
    const games = [];
    const gameIds = Object.keys(this.games);
    for (const gameId of gameIds) {
      if (this.games[gameId].users.includes(id)) {
        games.push(this.games[gameId]);
      }
    }

    return games;
  }
  getGameById(id: string): Game | null {
    return this.games[id];
  }
  joinGame(userId: string, gameId: string): boolean {
    let success = false;
    const game = this.games[gameId];
    if (game) {
      if (game.users.includes(userId)) {
        success = true;
      } else if (game.users.length < 2) {
        this.games[gameId].users.push(userId);
        success = true;
      }
    }
    return success;
  }
  saveGame(gameId: string, game: Game): boolean {
    this.games[gameId] = game;
    return true;
  }
  makeGameMove(userId: string, gameId: string, move: HexCoord[]): void {
    const game = this.games[gameId];
    if (game == null || game == undefined) {
      throw new Error("Game not found");
    }
    const gm = new GameManager(game);

    try {
      const newGame = gm.makeMove(userId, move);
      this.saveGame(gameId, newGame);
    } catch (e) {
      console.log("error", e);
      throw e;
    }
  }
}
