import { ulid } from "ulid";
import { getRandomCharacter, isValidWord } from "../alphaHelpers";
// import { Game,  } from "../types";
import Game from "../Game";
import HexGrid from "../hexgrid";
import { HexCoord } from "../types";

export default class SQLite {
  games: {
    [key: string]: Game;
  };
  constructor() {
    this.games = {};
  }

  getGamesByUserId(id: string): Game[] {
    const games = [];
    const gameIds = Object.keys(this.games);
    for (const gameId of gameIds) {
      if (this.games[gameId].users.includes(id)) {
        games.push(this.games[gameId]);
      }
    }

    return games;
  }
  getGameById(id: string): Game | null {
    return this.games[id];
  }
  createGame(userId: string): Game {
    const gameData = {
      id: ulid(),
      turn: 0 as 0 | 1,
      users: [userId],
      grid: new HexGrid(),
    };
    const game = new Game(gameData);
    this.games[game.id] = game;
    return game;
  }
  joinGame(userId: string, gameId: string): boolean {
    let success = false;
    const game = this.games[gameId];
    if (game) {
      if (game.users.includes(userId)) {
        success = true;
      } else if (game.users.length < 2) {
        this.games[gameId].users.push(userId);
        success = true;
      }
    }
    return success;
  }
  makeGameMove(userId: string, gameId: string, move: HexCoord[]): void {
    const game = this.games[gameId];
    if (game == null || game == undefined) {
      throw new Error("Game not found");
    }

    if (!game.users.includes(userId)) {
      throw new Error("Not your game");
    }
    const turnUser = game.users[game.turn];
    if (userId != turnUser) {
      throw new Error("Not your turn");
    }

    let word = "";
    for (const coord of move) {
      try {
        const cell = game.grid.getCell(coord.q, coord.r);
        if (cell && cell.owner == 2) {
          word += cell.value;
        } else {
          throw new Error("Cell in use");
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
      const cell = game.grid.getCell(coord.q, coord.r);
      if (cell != null) {
        cell.owner = game.turn;
        game.grid.setCell(cell);
      }
    }
    for (const coord of move) {
      const stack: HexCoord[] = [coord];
      let valid = false;
      while (stack.length) {
        const current = stack.pop();
        if (current != undefined) {
          const neighbors = game.grid.getCellNeighbors(current.q, current.r);
          const ownedNeighbors = neighbors.filter((cell) => {
            return cell.owner == game.turn;
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
        const cell = game.grid.getCell(coord.q, coord.r);
        if (cell != null) {
          cell.owner = 2;
        }
      }
    }

    // Make all adjacent tiles owned by opponent owned by 2
    for (const coord of move) {
      const cell = game.grid.getCell(coord.q, coord.r);
      if (cell != null && cell.owner == game.turn) {
        const neighbors = game.grid.getCellNeighbors(cell.q, cell.r);
        for (const neighbor of neighbors) {
          if (neighbor.owner == (Number(!game.turn) as 0 | 1)) {
            neighbor.owner = 2;
            game.grid.setCell(neighbor);
          }
        }
      }
    }

    // Change value of all cells used but not owned
    for (const coord of move) {
      const cell = game.grid.getCell(coord.q, coord.r);
      if (cell != null && cell.owner == 2) {
        cell.value = getRandomCharacter();
        game.grid.setCell(cell);
      }
    }
    const nextTurn = game.turn == 0 ? 1 : 0;
    game.turn = nextTurn;
    this.games[game.id] = game;
  }
}
