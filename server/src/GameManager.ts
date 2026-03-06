import * as R from "ramda";
import { nanoid } from "nanoid";
import bunyan from "bunyan";
import * as opentelemetry from "@opentelemetry/api";

const logger = bunyan.createLogger({
  name: "buzzwords-server",
});

const tracer = opentelemetry.trace.getTracer("buzzwords-game-manager");

import Game, { TimerConfig } from "buzzwords-shared/Game";
import { HexCoord } from "buzzwords-shared/types";
import {
  getCellsToBeReset,
  willBecomeOwned,
} from "buzzwords-shared/gridHelpers";
import { isValidWord } from "buzzwords-shared/alphaHelpers";
import HexGrid, {
  makeHexGrid,
  getCell,
  getCellNeighbors,
  setCell,
  getNewCellValues,
} from "buzzwords-shared/hexgrid";

import { WordsObject, wordsBySortedLetters } from "./words";
import Cell from "buzzwords-shared/cell";

/**
 * Returns the start time for the current move.
 * For timed games: when the player started their timer.
 * For untimed games: when the previous move was submitted (or game creation for the first move).
 */
function getMoveStartedAt(game: Game): Date {
  if (game.timerStartedAt) {
    return new Date(game.timerStartedAt);
  }
  const lastMove = game.moves[game.moves.length - 1];
  if (lastMove?.date) {
    return new Date(lastMove.date);
  }
  return game.createdDate ? new Date(game.createdDate) : new Date();
}

/**
 * Checks if the current player has exceeded their time budget.
 * Mutates game in place if timed out. Returns true if game ended by timeout.
 */
export function checkAndApplyTimeout(game: Game): boolean {
  if (!game.timerConfig || game.gameOver || !game.timerStartedAt) return false;
  const elapsed = Date.now() - game.timerStartedAt;
  if (game.timeRemaining![game.turn] - elapsed <= 0) {
    game.timeRemaining![game.turn] = 0;
    const startedAt = new Date(game.timerStartedAt);
    game.timerStartedAt = null;
    game.winner = Number(!game.turn) as 0 | 1;
    game.gameOver = true;
    game.moves.push({
      coords: [],
      grid: game.grid,
      letters: [],
      player: game.turn,
      startedAt,
      date: new Date(),
      timeout: true,
    });
    return true;
  }
  return false;
}

export default class GameManager {
  game: Game | null;
  constructor(game: Game | null) {
    this.game = game;
  }

  startTurn(userId: string): Game {
    if (!this.game) {
      throw new Error("Game Manager has no game!");
    }
    if (!this.game.timerConfig) {
      throw new Error("This game has no timer");
    }
    if (!this.game.users.includes(userId)) {
      throw new Error("Not your game");
    }
    if (this.game.gameOver) {
      throw new Error("Game is over");
    }
    const turnUser = this.game.users[this.game.turn];
    if (userId !== turnUser) {
      throw new Error("Not your turn");
    }
    if (this.game.users.length !== 2) {
      throw new Error("Need another player");
    }
    if (this.game.timerStartedAt !== null && this.game.timerStartedAt !== undefined) {
      throw new Error("Timer already running");
    }
    this.game.timerStartedAt = Date.now();
    return this.game;
  }

  pass(userId: string): Game {
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

    // Timer enforcement
    if (this.game.timerConfig) {
      if (!this.game.timerStartedAt) {
        throw new Error("You must start your turn timer first");
      }
      const elapsed = Date.now() - this.game.timerStartedAt;
      this.game.timeRemaining![this.game.turn] -= elapsed;
      if (this.game.timeRemaining![this.game.turn] <= 0) {
        this.game.timeRemaining![this.game.turn] = 0;
        const startedAt = new Date(this.game.timerStartedAt);
        this.game.timerStartedAt = null;
        this.game.winner = Number(!this.game.turn) as 0 | 1;
        this.game.gameOver = true;
        this.game.moves.push({
          coords: [],
          grid: this.game.grid,
          letters: [],
          player: this.game.turn,
          startedAt,
          date: new Date(),
          timeout: true,
        });
        return this.game;
      }
    }

    let opponentHasCapital = false;
    const opponentCells = [];
    for (const cell of Object.values(this.game.grid)) {
      if (cell.owner == Number(!this.game.turn)) {
        opponentCells.push(cell);
        if (cell.capital) {
          opponentHasCapital = true;
        }
      }
    }

    if (!opponentHasCapital) {
      const newCapital =
        opponentCells[Math.floor(Math.random() * opponentCells.length)];
      newCapital.capital = true;
      setCell(this.game.grid, newCapital);
    }

    const startedAt = getMoveStartedAt(this.game);
    if (this.game.timerConfig) {
      this.game.timerStartedAt = null;
    }

    this.game.moves.push({
      coords: [],
      grid: this.game.grid,
      letters: [],
      player: this.game.turn,
      startedAt,
      date: new Date(),
      pass: true,
    });
    const nextTurn = Number(!this.game.turn) as 0 | 1;
    this.game.turn = nextTurn;
    return this.game;
  }

  forfeit(userId: string): Game {
    if (!this.game) {
      throw new Error("Game Manager has no game!");
    }
    if (!this.game.users.includes(userId)) {
      throw new Error("Not your game");
    }
    if (this.game.gameOver) {
      throw new Error("Game is over");
    }
    if (this.game.users.length != 2) {
      throw new Error("Need another player");
    }

    const idx = this.game.users.indexOf(userId) as 0 | 1;

    // Deduct any elapsed timer time for accurate records
    if (this.game.timerConfig && this.game.timerStartedAt) {
      const elapsed = Date.now() - this.game.timerStartedAt;
      this.game.timeRemaining![idx] = Math.max(0, this.game.timeRemaining![idx] - elapsed);
      this.game.timerStartedAt = null;
    }

    const startedAt = getMoveStartedAt(this.game);
    this.game.winner = Number(!idx) as 0 | 1;
    this.game.gameOver = true;
    this.game.moves.push({
      coords: [],
      grid: this.game.grid,
      letters: [],
      player: idx,
      startedAt,
      date: new Date(),
      forfeit: true,
    });
    return this.game;
  }

  makeMove(userId: string, move: HexCoord[]): Game {
    return tracer.startActiveSpan("GameManager.makeMove", (span) => {
      try {
        span.setAttributes({
          "game.id": this.game?.id || "unknown",
          "game.userId": userId,
          "game.moveLength": move.length,
          "game.turn": this.game?.turn || -1
        });

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

        // Timer enforcement
        if (this.game.timerConfig) {
          if (!this.game.timerStartedAt) {
            throw new Error("You must start your turn timer first");
          }
          const elapsed = Date.now() - this.game.timerStartedAt;
          this.game.timeRemaining![this.game.turn] -= elapsed;
          if (this.game.timeRemaining![this.game.turn] <= 0) {
            this.game.timeRemaining![this.game.turn] = 0;
            const startedAt = new Date(this.game.timerStartedAt);
            this.game.timerStartedAt = null;
            this.game.winner = Number(!this.game.turn) as 0 | 1;
            this.game.gameOver = true;
            this.game.moves.push({
              coords: [],
              grid: this.game.grid,
              letters: [],
              player: this.game.turn,
              startedAt,
              date: new Date(),
              timeout: true,
            });
            span.setStatus({ code: opentelemetry.SpanStatusCode.OK });
            return this.game;
          }
        }

        const moveStartedAt = getMoveStartedAt(this.game);

        let word = "";
        tracer.startActiveSpan("GameManager.validateMove", (validateSpan) => {
          try {
            for (const coord of move) {
              try {
                const cell = getCell(this.game!.grid, coord.q, coord.r);
                if (cell && cell.owner == 2 && cell.value) {
                  word += cell.value;
                } else {
                  throw new Error("Cell in use or inactive");
                }
              } catch (e) {
                throw new Error("Invalid coords");
              }
            }
            logger.info({word}, "move received word");

            validateSpan.setAttributes({
              "game.word": word,
              "game.wordLength": word.length
            });

            if (!isValidWord(word, WordsObject)) {
              logger.info({word}, "word invalid");
              throw new Error("Not a valid word");
            }

            validateSpan.setStatus({ code: opentelemetry.SpanStatusCode.OK });
          } catch (error) {
            validateSpan.recordException(error as Error);
            validateSpan.setStatus({
              code: opentelemetry.SpanStatusCode.ERROR,
              message: (error as Error).message
            });
            throw error;
          } finally {
            validateSpan.end();
          }
        });

        return tracer.startActiveSpan("GameManager.processGrid", (gridSpan) => {
          try {
            const gridCopy: { [coord: string]: Cell } = {};
            Object.keys(this.game!.grid).forEach((key) => {
              const cell = this.game && this.game.grid[key];
              if (cell) {
                gridCopy[key] = R.omit(["_id"], cell);
              }
            });

            const gameMove = {
              grid: gridCopy,
              coords: move,
              letters: move.map(
                (m) => getCell(this.game!.grid as HexGrid, m.q, m.r)?.value ?? ""
              ),
              player: this.game!.turn,
              startedAt: moveStartedAt,
              date: new Date(),
              shuffle: false,
            };

            const turn = this.game!.turn;

            let capitalCaptured = false;

            // Make all tiles adjacent to move neutral and active
            const resetTiles = getCellsToBeReset(this.game!.grid, move, this.game!.turn);

            // Parsed word, checked validity of move and word etc.
            // Have to check for what's attached to current territory to see what to expand
            // Have to check from above to see what is adjacent to enemy territory to see what to remove
            // change whose turn it is
            const toBecomeOwned = willBecomeOwned(this.game!.grid, move, this.game!.turn);

            gridSpan.setAttributes({
              "game.resetTilesCount": resetTiles.length,
              "game.toBecomeOwnedCount": toBecomeOwned.length
            });

            const toBeReset = R.difference(resetTiles, toBecomeOwned);

            for (const cell of toBecomeOwned) {
              cell.owner = this.game!.turn;
              if (cell.owner == this.game!.turn) {
                cell.value = "";
              }

              setCell(this.game!.grid, cell);
            }
            const keys = R.difference(
              R.difference(
                Object.keys(this.game!.grid),
                toBeReset.map((cell) => `${cell.q},${cell.r}`)
              ),
              toBecomeOwned.map((cell) => `${cell.q},${cell.r}`)
            );
            const grid = this.game!.grid;
            const letters = keys.map((k) => grid[k].value).filter(Boolean);

            const opponentKeys = Object.entries(this.game!.grid)
              .filter(([k, c]) => c.owner == Number(!turn))
              .map(([k, c]) => k);

            const gameOver =
              R.difference(
                opponentKeys,
                [...toBeReset, ...toBecomeOwned].map((c) => `${c.q},${c.r}`)
              ).length === 0;

            if (!gameOver) {
              try {
                const newCellValues = getNewCellValues(
                  letters,
                  toBeReset.length,
                  WordsObject
                );
                for (let i = 0; i < toBeReset.length; i++) {
                  const tile = toBeReset[i];
                  tile.owner = 2;
                  if (tile.capital) {
                    capitalCaptured = true;
                    tile.capital = false;
                  }
                  tile.value = newCellValues[i];
                  setCell(this.game!.grid, tile);
                }
              } catch (e) {
                // No possible combinations. Need to regenerate the whole board!!
                logger.info({ gameId: this.game!.id }, "No valid letter combinations. Shuffling board...");
                const newLetterCount = letters.length + toBeReset.length;
                const newCellValues = getNewCellValues([], newLetterCount, WordsObject);
                for (const tile of keys
                  .map((k) => grid[k])
                  .filter((k) => Boolean(k.value))) {
                  tile.owner = 2;
                  tile.value = newCellValues[0];
                  newCellValues.splice(0, 1);
                  setCell(this.game!.grid, tile);
                }
                for (const tile of toBeReset) {
                  tile.owner = 2;
                  if (tile.capital) {
                    capitalCaptured = true;
                    tile.capital = false;
                  }
                  tile.value = newCellValues[0];
                  newCellValues.splice(0, 1);
                  setCell(this.game!.grid, tile);
                }
                gameMove.shuffle = true;
              }
              this.game!.moves.push(gameMove);
            } else {
              for (const c of toBeReset) {
                c.value = "";
                c.owner = 2;
                setCell(this.game!.grid, c);
              }
              this.game!.moves.push(gameMove);
              this.game!.gameOver = true;
              this.game!.winner = this.game!.turn;
              if (this.game!.timerConfig) {
                this.game!.timerStartedAt = null;
              }

              gridSpan.setAttributes({
                "game.gameOver": true,
                "game.winner": this.game!.turn,
                "game.capitalCaptured": capitalCaptured
              });

              gridSpan.setStatus({ code: opentelemetry.SpanStatusCode.OK });
              return this.game!;
            }

            for (const cell of Object.values(this.game!.grid)) {
              if (cell.owner == 2) {
                const neighbors = getCellNeighbors(this.game!.grid, cell.q, cell.r);
                const playerNeighbors = neighbors.filter((c) => c.owner != 2);
                if (!playerNeighbors.length) {
                  cell.value = "";
                  setCell(this.game!.grid, cell);
                }
              }
            }

            const cells = this.game!.grid;
            const opponentCells = [];
            let opponentHasCapital = false;
            for (const cell of Object.values(cells)) {
              if (cell.owner == Number(!this.game!.turn)) {
                opponentCells.push(cell);
                if (cell.capital) {
                  opponentHasCapital = true;
                  break;
                }
              }
            }

            // If opponent has no capital at the end of your turn
            // but you didn't capture their capital this turn
            // randomly assign one of their cells to be capital
            if (!capitalCaptured && !opponentHasCapital) {
              const newCapital =
                opponentCells[Math.floor(Math.random() * opponentCells.length)];
              newCapital.capital = true;
              setCell(this.game!.grid, newCapital);
            }

            const nextTurn = capitalCaptured
              ? this.game!.turn
              : (Number(!this.game!.turn) as 0 | 1);
            this.game!.turn = nextTurn;

            // Update timer: auto-continue on bonus turn, reset for new player
            if (this.game!.timerConfig) {
              if (capitalCaptured) {
                // Same player gets another turn — auto-restart the timer
                this.game!.timerStartedAt = Date.now();
              } else {
                this.game!.timerStartedAt = null;
              }
            }

            gridSpan.setAttributes({
              "game.gameOver": this.game!.gameOver,
              "game.winner": this.game!.winner || -1,
              "game.nextTurn": nextTurn,
              "game.capitalCaptured": capitalCaptured
            });

            gridSpan.setStatus({ code: opentelemetry.SpanStatusCode.OK });
            return this.game!;
          } catch (error) {
            gridSpan.recordException(error as Error);
            gridSpan.setStatus({
              code: opentelemetry.SpanStatusCode.ERROR,
              message: (error as Error).message
            });
            throw error;
          } finally {
            gridSpan.end();
          }
        });
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({
          code: opentelemetry.SpanStatusCode.ERROR,
          message: (error as Error).message
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  createGame(userId: string, timerConfig?: TimerConfig): Game {
    const game: Game = {
      id: nanoid(),
      turn: 0 as 0 | 1,
      users: [userId],
      grid: makeHexGrid(),
      gameOver: false,
      winner: null,
      moves: [],
      vsAI: false,
      difficulty: 1,
      deleted: false,
    };
    if (timerConfig) {
      game.timerConfig = timerConfig;
      game.timeRemaining = [timerConfig.timePerPlayer, timerConfig.timePerPlayer];
      game.timerStartedAt = null;
    }
    const neighbors = [
      ...getCellNeighbors(game.grid, -2, -1),
      ...getCellNeighbors(game.grid, 2, 1),
    ];
    const newValues = getNewCellValues([], 12, WordsObject);
    let i = 0;
    for (const cell of neighbors) {
      cell.value = newValues[i];
      i++;
      game.grid = setCell(game.grid, cell);
    }
    game.grid["-2,-1"].capital = true;
    game.grid["-2,-1"].owner = 0;
    game.grid["2,1"].capital = true;
    game.grid["2,1"].owner = 1;

    this.game = game;
    return game;
  }
}
