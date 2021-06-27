import Game from "./Game";

export interface HexCoord {
  q: number;
  r: number;
}

export interface DataLayer {
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
