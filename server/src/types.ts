import Game from "buzzwords-shared/Game";

export interface User {
  id: string;
  nickname: string;
  googleId?: string;
}

export interface AuthToken {
  token: string;
  userId: string;
  createdDate: Date;
}

export interface DataLayer {
  createAuthToken(
    token: string,
    userId: string,
    options?: Record<string, unknown>
  ): Promise<boolean>;
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
  getGamesByUserId(
    id: string,
    options?: Record<string, unknown>
  ): Promise<Game[]>;
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
  createContext(): Promise<unknown>;
  commitContext(context: unknown): Promise<boolean>;
}
