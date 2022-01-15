import Game from "buzzwords-shared/Game";
import { DataLayer, User } from "../types";

export default class Memory implements DataLayer {
  games: {
    [key: string]: Game;
  };
  users: {
    [id: string]: User;
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

  async setNicknameAndMaybeCreateUser(
    id: string,
    nickname: string
  ): Promise<boolean> {
    let user = this.users[id];
    if (!user) {
      user = {
        nickname,
        id,
        hiddenGames: [],
      };
    }
    this.users[id] = {
      ...user,
      nickname,
    };
    return true;
  }

  async getNickName(id: string): Promise<string | null> {
    return this.users[id]?.nickname;
  }

  async getUser(id: string): Promise<User | null> {
    return this.users[id] ?? null;
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
  async hideGameForUser(userId: string, gameId: string): Promise<boolean> {
    const user = this.users[userId];
    this.users[userId] = {
      ...user,
      hiddenGames: [...user.hiddenGames, gameId],
    };
    return true;
  }
}
