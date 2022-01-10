import HexGrid from "./hexgrid";
import { HexCoord } from "./types";

export interface Move {
  grid: HexGrid;
  coords: HexCoord[];
  letters: string[];
  player: 0 | 1;
}

export default interface Game {
  id: string;
  users: string[];
  vsAI: boolean;
  difficulty: number;
  turn: 0 | 1;
  grid: HexGrid;
  gameOver: boolean;
  winner: 0 | 1 | null;
  moves: Move[];
  createdDate?: Date;
  updatedDate?: Date;
}
