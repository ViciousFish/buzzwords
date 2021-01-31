import Game from "./Game";

export interface HexCoord {
  q: number;
  r: number;
}

export interface DataLayer {
  getGamesByUserId(id: string): Promise<Game[]>;
  getGameById(id: string): Promise<Game | null>;
  saveGame(gameId: string, game: Game): Promise<boolean>;
  joinGame(userId: string, gameId: string): Promise<boolean>;
  joinRandomGame(userId: string): Promise<boolean>;
}
