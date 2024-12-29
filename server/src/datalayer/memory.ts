import Game from "buzzwords-shared/Game";
import { AuthToken, DataLayer, PushToken, User } from "../types";

export default class Memory implements DataLayer {
  games: {
    [key: string]: Game;
  };
  users: {
    [key: string]: User;
  };
  authTokens: {
    [key: string]: AuthToken;
  } = {};
  pushTokens: {
    [key: string]: PushToken;
  } = {};
  constructor() {
    this.games = {};
    this.users = {};
  }

  async createUser(
    id: string,
    option?: Record<string, unknown>
  ): Promise<User> {
    this.users[id] = {
      id,
      nickname: null,
      googleId: null,
    };
    return this.users[id];
  }

  async deleteUser(
    id: string,
    option?: Record<string, unknown>
  ): Promise<boolean> {
    delete this.users[id];
    return true;
  }

  async createAuthToken(
    token: string,
    userId: string,
    options?: Record<string, unknown>
  ): Promise<boolean> {
    this.authTokens[token] = {
      token,
      userId,
      createdDate: new Date(),
      deleted: false,
      state: null,
    };
    return true;
  }

  async deleteAuthToken(
    token: string,
    options?: Record<string, unknown>
  ): Promise<boolean> {
    this.authTokens[token] = {
      ...(this.authTokens[token] || {}),
      deleted: true,
    };
    return true;
  }

  async setAuthTokenState(
    token: string,
    state: string,
    options?: Record<string, unknown>
  ): Promise<boolean> {
    this.authTokens[token] = {
      ...this.authTokens[token],
      state,
    };
    return true;
  }

  async getAuthTokenByState(
    state: string,
    options?: Record<string, unknown>
  ): Promise<AuthToken | null> {
    return (
      Object.values(this.authTokens).find((t) => t.state === state) || null
    );
  }

  async assumeUser(
    assumeeId: string,
    assumerId: string,
    options?: Record<string, unknown>
  ): Promise<boolean> {
    for (const [gameId, game] of Object.entries(this.games)) {
      const idx = game.users.indexOf(assumeeId);
      if (idx != -1) {
        game.users[idx] = assumerId;
      }
      this.games[gameId] = game;
    }
    for (const [id, authToken] of Object.entries(this.authTokens)) {
      if (authToken.userId == assumeeId) {
        this.authTokens[id].userId = assumerId;
      }
    }
    return true;
  }

  async getUserIdByAuthToken(
    token: string,
    options?: Record<string, unknown>
  ): Promise<string | null> {
    const authToken = this.authTokens[token];
    return !authToken || authToken?.deleted ? null : authToken.userId;
  }

  async getUserById(
    id: string,
    options?: Record<string, unknown>
  ): Promise<User | null> {
    return this.users[id];
  }

  async getUserByGoogleId(
    googleId: string,
    options?: Record<string, unknown>
  ): Promise<User | null> {
    return (
      Object.values(this.users).find((u) => u.googleId === googleId) ?? null
    );
  }

  async setUserGoogleId(
    userId: string,
    googleId: string,
    options?: Record<string, unknown>
  ): Promise<boolean> {
    this.users[userId] = {
      ...this.users[userId],
      googleId,
    };
    return true;
  }

  async setNickName(id: string, nickname: string): Promise<boolean> {
    this.users[id] = {
      ...this.users[id],
      nickname,
    };
    return true;
  }

  async getNickName(id: string): Promise<string | null> {
    return this.users[id]?.nickname || null;
  }

  async getNickNames(ids: string[]): Promise<{ [key: string]: string | null }> {
    const nicknames: { [key: string]: string | null } = {};
    for (const id of ids) {
      const nick = this.users[id]?.nickname;
      nicknames[id] = nick || null;
    }
    return nicknames;
  }

  async getGamesByUserId(id: string): Promise<Game[]> {
    const games = [];
    const gameIds = Object.keys(this.games);
    for (const gameId of gameIds) {
      if (
        this.games[gameId].users.includes(id) &&
        !this.games[gameId].deleted
      ) {
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

  async getActiveUsersBetweenDates(): Promise<number> {
    return 0;
  }

  async storePushToken(token: string, userId: string): Promise<boolean> {
    this.pushTokens[token] = {
      token,
      userId,
      lastTouchedDate: new Date(),
    };
    return true;
  }

  async deletePushToken(token: string): Promise<boolean> {
    delete this.pushTokens[token];
    return true;
  }

  async getPushTokensByUserId(userId: string): Promise<PushToken[]> {
    return Object.values(this.pushTokens).filter((pt) => pt.userId == userId);
  }

  async createContext(): Promise<null> {
    return null;
  }

  async commitContext(context: null): Promise<boolean> {
    return true;
  }
}
