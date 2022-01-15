import Game from "buzzwords-shared/Game";

export interface User {
  id: string;
  nickname: string | null;
  hiddenGames: string[];
}
export interface DataLayer {
  createAuthToken(
    token: string,
    userId: string,
    options?: Record<string, unknown>
  ): Promise<boolean>;
  getUserIdByAuthToken(
    token: string,
    options?: Record<string, unknown>
  ): Promise<string | null>;
  setNicknameAndMaybeCreateUser(
    id: string,
    nickname: string,
    options?: Record<string, unknown>
  ): Promise<boolean>;
  getNickName(
    id: string,
    options?: Record<string, unknown>
  ): Promise<string | null>;
  getUser(id: string): Promise<User | null>;
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
  hideGameForUser(userId: string, gameId: string): Promise<boolean>;
}
