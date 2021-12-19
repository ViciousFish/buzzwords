import { nanoid } from "nanoid";
import { Cell, getActivatedCell } from "../cell/cell";

import { getCellNeighbors, getEmptyGrid, HexGrid } from "../hexGrid/hexGrid";

export enum GamePlayer {
  P1 = 0,
  P2 = 1,
  Nobody = 2
}

export interface Game {
  id: string;
  users: string[];
  turn: GamePlayer;
  grid: HexGrid;
  gameOver: boolean;
  winner: GamePlayer | null;
  moves: {
    coords: {
      q: number,
      r: number
    }[];
    letters: string[];
    player: 0 | 1
  }[]
}

// export const getEmptyGame = (userId: string): Game => {
//   const game = {
//     id: nanoid(),
//     turn: GamePlayer.P1,
//     users: [userId],
//     grid: getEmptyGrid(),
//     gameOver: false,
//     winner: null,
//   };

//   game.grid["-2,-1"].capital = true;
//   game.grid["-2,-1"].owner = GamePlayer.P1
//   game.grid["-2,-1"].active = true;
//   let neighbors = getCellNeighbors(-2, -1, game.grid);
//   for (const cell of neighbors) {
//     game.grid[`${cell.q},${cell.r}`] = getActivatedCell(cell);
//   }

//   game.grid["2,1"].capital = true;
//   game.grid["2,1"].owner = GamePlayer.P2
//   game.grid["2,1"].active = true;
//   neighbors = getCellNeighbors(2, 1, game.grid);
//   for (const cell of neighbors) {
//     game.grid[`${cell.q},${cell.r}`] = getActivatedCell(cell);
//   }
//   return game;
// };
