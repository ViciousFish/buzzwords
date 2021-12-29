import HexGrid from "./hexgrid";
import { HexCoord } from "./types";

interface Move {
  coords: HexCoord[];
  letters: string[];
  player: 0 | 1;
}

export default interface Game {
  id: string;
  users: string[];
  turn: 0 | 1;
  grid: HexGrid;
  gameOver: boolean;
  winner: 0 | 1 | null;
  moves: Move[];
}
