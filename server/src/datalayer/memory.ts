import Game from "buzzwords-shared/Game";
import { DataLayer } from "../types";

export default class Memory implements DataLayer {
  games: {
    [key: string]: Game;
  };
  users: {
    [key: string]: {
      nickname: string;
    };
  };
  authTokens: {
    [key: string]: string;
  } = {};
  constructor() {
    this.games = {};
    this.users = {};
  }

  async createAuthToken(
    token: string,
    userId: string,
    options?: Record<string, unknown>
  ): Promise<boolean> {
    this.authTokens[token] = userId;
    return true;
  }

  async getUserIdByAuthToken(
    token: string,
    options?: Record<string, unknown>
  ): Promise<string | null> {
    return this.authTokens[token];
  }

  async setNickName(id: string, nickname: string): Promise<boolean> {
    this.users[id] = {
      ...this.users[id],
      nickname,
    };
    return true;
  }

  async getNickName(id: string): Promise<string | null> {
    return this.users[id]?.nickname;
  }

  async getGamesByUserId(id: string): Promise<Game[]> {
    const games = [];
    const gameIds = Object.keys(this.games);
    for (const gameId of gameIds) {
      if (this.games[gameId].users.includes(id)) {
        games.push(this.games[gameId]);
      }
    }

    return games;
  }
  async getGameById(id: string): Promise<Game | null> {
    return this.games[id];
  }
  async joinGame(userId: string, gameId: string): Promise<boolean> {
    let success = false;
    const game = this.games[gameId];
    if (game) {
      if (game.users.includes(userId)) {
        success = true;
      } else if (game.users.length < 2) {
        this.games[gameId].users.push(userId);
        success = true;
      } else {
        if (this.games[gameId].spectators) {
          this.games[gameId].spectators?.push(userId);
          success = true;
        } else {
          this.games[gameId].spectators = [userId];
          success = true;
        }
      }
    }
    return success;
  }
  async joinRandomGame(userId: string): Promise<boolean> {
    let success = false;
    const game = Object.values(this.games).filter(
      (g) => g.users.length == 1 && g.users[0] != userId
    )[0];
    if (game) {
      if (game.users.includes(userId)) {
        success = true;
      } else if (game.users.length < 2) {
        this.games[game.id].users.push(userId);
        success = true;
      }
    }
    return success;
  }
  async saveGame(gameId: string, game: Game): Promise<boolean> {
    this.games[gameId] = game;
    return true;
  }

  async createContext(): Promise<null> {
    return null;
  }

  async commitContext(context: null): Promise<boolean> {
    return true;
  }
}
