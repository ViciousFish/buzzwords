// import { Sequelize } from "sequelize";
import mongoose, { Model } from "mongoose";
import getConfig from "../../config";

import { DataLayer } from "../../types";
import { sleep, withRetry } from "../../util";
import Game from "../../Game";
import Models from "./models";
import Cell from "../../cell";
import HexGrid from "../../hexgrid";

export default class Mongo implements DataLayer {
  connected = false;
  constructor() {
    this.createConnection().then(() => {
      console.log("Connecting to db...");
    });
  }

  async createConnection(): Promise<void> {
    try {
      const config = getConfig();
      const retryConnect = withRetry(mongoose.connect, 0);
      retryConnect(config.mongoUrl, {
        autoReconnect: true,
      });
      const db = mongoose.connection;
      db.on("error", () => {
        // console.error.bind(console, "connection error:");
        this.connected = false;
        console.log("DB error! Not connected");
      });
      db.on("open", () => {
        this.connected = true;
        console.log("Connected to db!");
      });
      db.on("disconnected", () => {
        console.log("disconnected from db");
        this.connected = false;
      });
      db.on("reconnected", () => {
        console.log("reconnected to db");
        this.connected = true;
      });
    } catch (e) {
      console.log(e);
    }
  }

  async getGamesByUserId(id: string): Promise<Game[]> {
    const games = [];
    if (!this.connected) {
      throw new Error("Db not connected");
    }
    try {
      const res = await Models.Game.find({
        users: id,
      });
      if (res && res.length) {
        for (const gameDoc of res) {
          const cellMap: {
            [key: string]: Cell;
          } = {};
          for (const cell of gameDoc.grid) {
            cellMap[`${cell.q},${cell.r}`] = cell;
          }
          const game = (res as unknown) as Game;
          game.grid = new HexGrid(cellMap);
          games.push(game);
        }
      }
      return games;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
  async getGameById(id: string): Promise<Game | null> {
    if (!this.connected) {
      throw new Error("Db not connected");
    }
    try {
      const res = await Models.Game.findOne({
        ulid: id,
      });
      if (res) {
        const cellMap: {
          [key: string]: Cell;
        } = {};
        for (const cell of res.grid) {
          cellMap[`${cell.q},${cell.r}`] = cell;
        }
        const game = (res as unknown) as Game;
        game.grid = new HexGrid(cellMap);
        return game;
      }
      return null;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
  async joinGame(userId: string, gameId: string): Promise<boolean> {
    if (!this.connected) {
      throw new Error("Db not connected");
    }
    try {
      const res = await Models.Game.updateOne(
        {
          ulid: gameId,
          users: {
            $size: 1,
            $nin: [userId],
          },
        },
        {
          $push: { users: userId },
        }
      );
      return res.nModified == 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async joinRandomGame(userId: string): Promise<boolean> {
    if (!this.connected) {
      throw new Error("Db not connected");
    }
    try {
      const res = await Models.Game.updateOne(
        {
          users: {
            $size: 1,
            $nin: [userId],
          },
        },
        {
          $push: { users: userId },
        }
      );
      return res.nModified == 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async saveGame(gameId: string, game: Game): Promise<boolean> {
    if (!this.connected) {
      return false;
    }
    try {
      const dbGame: any = game;
      dbGame.grid = Object.values(game.grid.cellMap);
      const res = await Models.Game.updateOne({ ulid: gameId }, dbGame, {
        upsert: true,
      });
      console.log(res);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
