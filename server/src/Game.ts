import HexGrid from "./hexgrid";

export default class Game {
  id: string;
  users: string[];
  turn: 0 | 1;
  grid: HexGrid;
  constructor(state: Game) {
    this.id = state.id;
    this.users = state.users;
    this.turn = state.turn;
    this.grid = state.grid;
  }
}
