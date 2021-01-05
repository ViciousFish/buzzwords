import Game from "./Game";

export interface HexCoord {
  q: number;
  r: number;
}

export interface DataLayer {
  getGamesByUserId(id: string): Game[];
  getGameById(id: string): Game | null;
  // createGame(userId: string): Game;
  saveGame(gameId: string, game: Game): boolean;
  joinGame(userId: string, gameId: string): boolean;
  makeGameMove(userId: string, gameId: string, move: HexCoord[]): void;
  // getUserById(id: string): User;
}
