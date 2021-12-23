import { getRandomCharacter } from "../../shared/alphaHelpers";
import HexGrid from "../../shared/hexgrid";
import { HexCoord } from "../../shared/types";

interface Move {
  coords: HexCoord[];
  letters: string[];
  player: 0 | 1;
}
export default class Game {
  id: string;
  users: string[];
  turn: 0 | 1;
  grid: HexGrid;
  gameOver: boolean;
  winner: 0 | 1 | null;
  moves: Move[];
  constructor(state: {
    id: string;
    users: string[];
    turn: 0 | 1;
    grid: HexGrid;
    gameOver: boolean;
    winner: 0 | 1 | null;
    moves: Move[];
  }) {
    this.id = state.id;
    this.users = state.users;
    this.turn = state.turn;
    this.grid = state.grid;
    this.gameOver = state.gameOver;
    this.winner = state.winner;
    this.moves = state.moves;
  }

  randomizeCellValue(q: number, r: number) {
    const cell = this.grid.getCell(q, r);
    if (cell) {
      cell.value = getRandomCharacter();
      this.grid.setCell(cell);
    }
  }
}
