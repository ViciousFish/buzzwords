import Game, { ShallowGame } from "buzzwords-shared/Game";

export interface User {
  id: string;
  nickname: string | null;
  googleId: string | null;
}

export interface AuthToken {
  token: string;
  userId: string;
  createdDate: Date;
  deleted?: boolean;
  state: string | null;
}

export interface PushToken {
  token: string;
  userId: string;
  lastTouchedDate: Date;
}

export interface DataLayer {
  createUser(id: string, options?: Record<string, unknown>): Promise<User>;
  deleteUser(id: string, options?: Record<string, unknown>): Promise<boolean>;
  createAuthToken(
    token: string,
    userId: string,
    options?: Record<string, unknown>
  ): Promise<boolean>;
  deleteAuthToken(
    token: string,
    options?: Record<string, unknown>
  ): Promise<boolean>;
  setAuthTokenState(
    token: string,
    state: string,
    options?: Record<string, unknown>
  ): Promise<boolean>;
  getAuthTokenByState(
    state: string,
    options?: Record<string, unknown>
  ): Promise<AuthToken | null>;
  assumeUser(
    assumeeId: string,
    assumerId: string,
    options?: Record<string, unknown>
  ): Promise<boolean>;
  getUserById(
    id: string,
    options?: Record<string, unknown>
  ): Promise<User | null>;
  setUserGoogleId(
    userId: string,
    googleId: string,
    options?: Record<string, unknown>
  ): Promise<boolean>;
  getUserByGoogleId(
    googleId: string,
    options?: Record<string, unknown>
  ): Promise<User | null>;
  getUserIdByAuthToken(
    token: string,
    options?: Record<string, unknown>
  ): Promise<string | null>;
  setNickName(
    id: string,
    nickname: string,
    options?: Record<string, unknown>
  ): Promise<boolean>;
  getNickName(
    id: string,
    options?: Record<string, unknown>
  ): Promise<string | null>;
  getNickNames(
    ids: string[],
    options?: Record<string, unknown>
  ): Promise<{ [key: string]: string | null }>;
  getGamesByUserId(
    id: string,
    options?: Record<string, unknown>
  ): Promise<ShallowGame[]>;
  getGameById(
    id: string,
    options?: Record<string, unknown>
  ): Promise<Game | null>;
  saveGame(
    gameId: string,
    game: Game,
    options?: Record<string, unknown>
  ): Promise<boolean>;
  joinGame(
    userId: string,
    gameId: string,
    options?: Record<string, unknown>
  ): Promise<boolean>;
  joinRandomGame(
    userId: string,
    options?: Record<string, unknown>
  ): Promise<boolean>;
  storePushToken(
    token: string,
    userId: string,
    options?: Record<string, unknown>
  ): Promise<boolean>;
  deletePushToken(
    token: string,
    options?: Record<string, unknown>
  ): Promise<boolean>;
  getPushTokensByUserId(
    userId: string,
    options?: Record<string, unknown>
  ): Promise<PushToken[]>;
  createContext(): Promise<unknown>;
  commitContext(context: unknown): Promise<boolean>;
  getActiveUsersBetweenDates(startDate: Date, endDate: Date): Promise<number>;
}
