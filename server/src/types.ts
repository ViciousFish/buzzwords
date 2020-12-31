export interface Game {
  id: string;
  users: string[];
  turn: boolean;
  grid: string;
}
export interface User {
  id: number;
  name: string;
}
export interface DataLayer {
  getGamesByUserId(id: string): Game[];
  getGameById(id: string): Game | null;
  createGame(userId: string): Game;
  joinGame(userId: string, gameId: string): boolean;
  makeGameMove(userId: string, gameId: string, move: string): void;
  // getUserById(id: string): User;
}
