import Game from "./Game";
import { HexCoord } from "./types";
import { isValidWord, getRandomCharacter } from "../../shared/alphaHelpers";
import { nanoid } from "nanoid";
import HexGrid from "./hexgrid";

export const errors = {};

export default class GameManager {
  game: Game | null;
  constructor(game: Game | null) {
    this.game = game;
  }

  makeMove(userId: string, move: HexCoord[]): Game {
    if (!this.game) {
      throw new Error("Game Manager has no game!");
    }
    if (!this.game.users.includes(userId)) {
      throw new Error("Not your game");
    }
    if (this.game.gameOver) {
      throw new Error("Game is over");
    }
    const turnUser = this.game.users[this.game.turn];
    if (userId != turnUser) {
      throw new Error("Not your turn");
    }
    if (this.game.users.length != 2) {
      throw new Error("Need another player");
    }

    let word = "";
    for (const coord of move) {
      try {
        const cell = this.game.grid.getCell(coord.q, coord.r);
        if (cell && cell.owner == 2 && cell.active) {
          word += cell.value;
        } else {
          throw new Error("Cell in use or inactive");
        }
      } catch (e) {
        throw new Error("Invalid coords");
      }
    }
    if (!isValidWord(word)) {
      throw new Error("Not a valid word");
    }

    // Parsed word, checked validity of move and word etc.
    // Have to check for what's attached to current territory to see what to expand
    // Have to check from above to see what is adjacent to enemy territory to see what to remove
    // change whose turn it is
    for (const coord of move) {
      // Assume all coords in move ARE attached
      // For each coord
      // If you can make it to user territory that isn't in move, then its valid.
      const cell = this.game.grid.getCell(coord.q, coord.r);
      if (cell != null) {
        cell.owner = this.game.turn;
        this.game.grid.setCell(cell);
      }
    }
    for (const coord of move) {
      const stack: HexCoord[] = [coord];
      let valid = false;
      while (stack.length) {
        const current = stack.pop();
        if (current != undefined) {
          const neighbors = this.game.grid.getCellNeighbors(
            current.q,
            current.r
          );
          const ownedNeighbors = neighbors.filter((cell) => {
            // @ts-expect-error idk why it thinks this could be null
            return cell.owner == this.game.turn;
          });
          const nonTurnOwnedNeighbors = ownedNeighbors.filter((cell) => {
            let notInMove = true;
            for (const m of move) {
              if (m.q == cell.q && m.r == cell.r) {
                notInMove = false;
                break;
              }
            }
            return notInMove;
          });
          const turnOwnedNeighbors = ownedNeighbors.filter((cell) => {
            let inMove = false;
            for (const m of move) {
              if (m.q == cell.q && m.r == cell.r) {
                inMove = true;
                break;
              }
            }
            return inMove;
          });
          if (nonTurnOwnedNeighbors.length) {
            // For sure its valid
            valid = true;
            break;
          }
          stack.concat(turnOwnedNeighbors);
        }
      }
      if (!valid) {
        // This cell should be set back to owner = 2
        const cell = this.game.grid.getCell(coord.q, coord.r);
        if (cell != null) {
          cell.owner = 2;
        }
      }
    }
    let capitalCaptured = false;
    // Make all adjacent tiles owned by opponent owned by 2
    for (const coord of move) {
      const cell = this.game.grid.getCell(coord.q, coord.r);
      if (cell != null && cell.owner == this.game.turn) {
        const neighbors = this.game.grid.getCellNeighbors(cell.q, cell.r);
        for (const neighbor of neighbors) {
          if (neighbor.owner == (Number(!this.game.turn) as 0 | 1)) {
            neighbor.owner = 2;
            if (neighbor.capital) {
              capitalCaptured = true;
              neighbor.capital = false;
            }
            this.game.grid.setCell(neighbor);
          }
        }
      }
      if (cell != null && !cell.active) {
        this.game.activateCell(cell.q, cell.r);
      }
    }

    // Change value of all cells used but not owned
    for (const coord of move) {
      const cell = this.game.grid.getCell(coord.q, coord.r);
      if (cell != null && cell.owner == 2) {
        cell.value = getRandomCharacter();
        this.game.grid.setCell(cell);
      }
    }

    const cells = this.game.grid.cellMap;
    const opponentCells = [];
    let opponentHasCapital = false;
    for (const cell of Object.values(cells)) {
      if (cell.owner == Number(!this.game.turn)) {
        opponentCells.push(cell);
        if (cell.capital) {
          opponentHasCapital = true;
        }
      }
    }
    // GAME OVER
    if (opponentCells.length == 0) {
      this.game.gameOver = true;
      this.game.winner = this.game.turn;
      return this.game;
    }

    // If opponent has no capital at the end of your turn
    // but you didn't capture their capital this turn
    // randomly assign one of their cells to be capital
    if (!capitalCaptured && !opponentHasCapital) {
      const newCapital =
        opponentCells[Math.floor(Math.random() * opponentCells.length)];
      newCapital.capital = true;
      this.game.grid.setCell(newCapital);
    }

    const nextTurn = capitalCaptured
      ? this.game.turn
      : (Number(!this.game.turn) as 0 | 1);
    this.game.turn = nextTurn;
    return this.game;
  }

  createGame(userId: string): Game {
    const gameData = {
      id: nanoid(),
      turn: 0 as 0 | 1,
      users: [userId],
      grid: new HexGrid(),
      gameOver: false,
      winner: null,
    };
    const game = new Game(gameData);
    game.grid.cellMap["-2,-1"].capital = true;
    game.grid.cellMap["-2,-1"].owner = 0;
    game.grid.cellMap["-2,-1"].active = true;
    let neighbors = game.grid.getCellNeighbors(-2, -1);
    for (const cell of neighbors) {
      game.activateCell(cell.q, cell.r);
    }

    game.grid.cellMap["2,1"].capital = true;
    game.grid.cellMap["2,1"].owner = 1;
    game.grid.cellMap["2,1"].active = true;
    neighbors = game.grid.getCellNeighbors(2, 1);
    for (const cell of neighbors) {
      game.activateCell(cell.q, cell.r);
    }
    this.game = game;
    return game;
  }
}
