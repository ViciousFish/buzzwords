import { Sequelize } from "sequelize";
import getConfig from "../../config";

import { DataLayer, HexCoord } from "../../types";
import { sleep, withRetry } from "../../util";
import Game from "../../Game";
import { PGModels, createModels } from "./models";
import Cell from "../../cell";
import HexGrid from "../../hexgrid";

export default class Postgres implements DataLayer {
  sequelize: Sequelize | undefined;
  models: PGModels | undefined;
  constructor() {
    this.createConnection().then(() => {
      if (this.sequelize) {
        createModels(this.sequelize).then((models) => {
          this.models = models;
        });
      }
    });
  }

  async createConnection(): Promise<void> {
    const config = getConfig();
    const pgURL = `postgres://${config.pg.user}:${config.pg.password}@${config.pg.host}:${config.pg.port}/${config.pg.db}`;
    this.sequelize = new Sequelize(pgURL);
    try {
      await withRetry(async () => {
        if (this.sequelize) {
          await this.sequelize.authenticate();
        } else {
          throw new Error("No sequelize object");
        }
      }, 10)();
      console.log("Connection has been established successfully.");
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      process.exit(1);
    }
  }

  async getGamesByUserId(id: string): Promise<Game[]> {
    // if (this.sequelize && this.models) {
    //   const p1Games = await this.models.Game.findAll({
    //     where: {
    //       player1: id,
    //     },
    //     include: {
    //       model: this.models.Cell,
    //     },
    //   });
    //   const p2Games = await this.models.Game.findAll({
    //     where: {
    //       player2: id,
    //     },
    //     include: {
    //       model: this.models.Cell,
    //     },
    //   });
    // }
    throw new Error("not implemented");
  }
  async getGameById(id: string): Promise<Game | null> {
    if (this.sequelize && this.models) {
      const [g, cells] = await this.sequelize.transaction(async (t) => {
        if (this.sequelize && this.models) {
          const dbCells =
            (await this.models.Cell.findAll({
              where: {
                gameId: id,
              },
              transaction: t,
            })) || [];

          const dbGame = await this.models.Game.findByPk(id, {
            transaction: t,
          });

          return [dbGame, dbCells];
        }
        return [null, []];
      });
      if (!g) {
        return null;
      }
      const cellMap = {};
      for (const c of cells) {
        // @ts-expect-error idk
        const cell = new Cell(c.q, c.r);
        // @ts-expect-error idk
        cell.capital = c.capital;
        // @ts-expect-error idk
        cell.active = c.active;
        // @ts-expect-error idk
        cell.owner = c.owner;
        // @ts-expect-error idk
        cell.value = c.value;
        // @ts-expect-error idk
        cellMap[`${cell.q},${cell.r}`] = cell;
      }
      const grid = new HexGrid(cellMap);
      // @ts-expect-error idk
      g.grid = grid;
      // @ts-expect-error idk
      const game = new Game(g);
      return game;
    }
    throw new Error("Postgres connection not initialized");
  }
  async joinGame(userId: string, gameId: string): Promise<boolean> {
    throw new Error("not implemented");
  }
  async saveGame(gameId: string, game: Game): Promise<boolean> {
    if (this.sequelize && this.models) {
      await this.sequelize.transaction(async (t) => {
        if (this.sequelize && this.models) {
          const promises = [];
          for (const cell of Object.values(game.grid.cellMap)) {
            promises.push(
              this.models.Cell.upsert(
                {
                  q: cell.q,
                  r: cell.r,
                  gameId: gameId,
                  value: cell.value,
                  capital: cell.capital,
                  owner: cell.owner,
                  active: cell.active,
                },
                {
                  transaction: t,
                }
              )
            );
          }
          promises.push(
            this.models.Game.upsert(
              {
                ulid: gameId,
                turn: game.turn,
                gameOver: game.gameOver,
                winner: game.winner,
              },
              { transaction: t }
            )
          );

          await Promise.all(promises);
        } else {
          throw new Error("Postgres connection not initialized");
        }
      });
    } else {
      throw new Error("Postgres connection not initialized");
    }
    return true;
  }
}
