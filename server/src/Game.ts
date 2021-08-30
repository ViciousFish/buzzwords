import { getRandomCharacter } from "../../shared/alphaHelpers";
import HexGrid from "./hexgrid";

export default class Game {
  id: string;
  users: string[];
  turn: 0 | 1;
  grid: HexGrid;
  gameOver: boolean;
  winner: 0 | 1 | null;
  constructor(state: {
    id: string;
    users: string[];
    turn: 0 | 1;
    grid: HexGrid;
    gameOver: boolean;
    winner: 0 | 1 | null;
  }) {
    this.id = state.id;
    this.users = state.users;
    this.turn = state.turn;
    this.grid = state.grid;
    this.gameOver = state.gameOver;
    this.winner = state.winner;
  }

  activateCell(q: number, r: number) {
    const cell = this.grid.getCell(q, r);
    if (cell) {
      cell.active = true;
      this.grid.setCell(cell);
      this.randomizeCellValue(q, r);
    }
  }

  randomizeCellValue(q: number, r: number) {
    const cell = this.grid.getCell(q, r);
    if (cell) {
      cell.value = getRandomCharacter();
      this.grid.setCell(cell);
    }
  }
}
