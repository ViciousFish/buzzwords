import { ulid } from "ulid";
import { Game, User } from "../types";

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
  createGame(userId: string): Game {
    const game = {
      id: ulid(),
      turn: false,
      users: [userId],
      grid: "",
    };
    this.games[game.id] = game;
    return game;
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
  makeGameMove(userId: string, gameId: string, move: string): void {
    throw new Error("Not implemented");
  }
}
