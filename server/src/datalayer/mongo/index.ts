import mongoose, { ClientSession } from "mongoose";
import getConfig from "../../config";

import { DataLayer } from "../../types";
import { withRetry } from "../../util";
import Game from "buzzwords-shared/Game";
import Models from "./models";

interface Options extends Record<string, unknown> {
  session?: ClientSession;
}
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
      retryConnect(config.mongoUrl, {});
      const db = mongoose.connection;
      db.on("error", () => {
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

  async createAuthToken(
    token: string,
    userId: string,
    options?: Options
  ): Promise<boolean> {
    if (!this.connected) {
      throw new Error("Db not connected");
    }
    try {
      const res = await Models.AuthToken.create({
        token,
        userId,
      });
      return true;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async getUserIdByAuthToken(
    token: string,
    options?: Options
  ): Promise<string | null> {
    if (!this.connected) {
      throw new Error("Db not connected");
    }
    try {
      const res = await Models.AuthToken.findOne(
        {
          token,
        },
        null,
        {
          session: options?.session,
        }
      );
      if (!res) {
        return null;
      }

      return res?.toObject()?.userId;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async setNickName(
    id: string,
    nickname: string,
    options: Options
  ): Promise<boolean> {
    if (!this.connected) {
      throw new Error("Db not connected");
    }
    try {
      const res: any = await Models.User.updateOne(
        {
          id,
        },
        {
          id,
          nickname,
        },
        {
          session: options?.session,
          upsert: true,
        }
      );
      return res.modifiedCount == 1 || res.upsertedCount == 1;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async getNickName(id: string, options: Options): Promise<string | null> {
    if (!this.connected) {
      throw new Error("Db not connected");
    }
    try {
      const res: any = await Models.User.findOne(
        {
          id,
        },
        null,
        {
          session: options?.session,
        }
      );
      if (!res) {
        return null;
      }
      return res.toObject().nickname;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async getGamesByUserId(id: string, options: Options): Promise<Game[]> {
    if (!this.connected) {
      throw new Error("Db not connected");
    }
    try {
      const res = await Models.Game.find(
        {
          users: id,
        },
        null,
        {
          session: options?.session,
        }
      );
      return res.map((d) => {
        const game = d?.toObject();
        // @ts-expect-error I promise this works
        game.grid = Object.fromEntries(game.grid);
        game.grid = Object.fromEntries(
          // @ts-expect-error This also works
          Object.entries(game.grid).map(([k, v]) => [k, v.toObject()])
        );
        return game;
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
  async getGameById(id: string, options: Options): Promise<Game | null> {
    if (!this.connected) {
      throw new Error("Db not connected");
    }
    try {
      const res: any = await Models.Game.findOne(
        {
          id,
        },
        null,
        {
          session: options?.session,
        }
      );
      if (!res) {
        return null;
      }
      const game = res.toObject();
      game.grid = Object.fromEntries(game.grid);
      game.grid = Object.fromEntries(
        // @ts-expect-error This also works
        Object.entries(game.grid).map(([k, v]) => [k, v.toObject()])
      );
      return game;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
  async joinGame(
    userId: string,
    gameId: string,
    options: Options
  ): Promise<boolean> {
    if (!this.connected) {
      throw new Error("Db not connected");
    }
    try {
      const res = await Models.Game.updateOne(
        {
          id: gameId,
          users: {
            $size: 1,
            $nin: [userId],
          },
        },
        {
          $push: { users: userId },
        },
        {
          session: options?.session,
        }
      );
      return res.modifiedCount == 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async joinRandomGame(userId: string, options: Options): Promise<boolean> {
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
        },
        {
          session: options?.session,
        }
      );
      return res.modifiedCount == 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async saveGame(
    gameId: string,
    game: Game,
    options: Options
  ): Promise<boolean> {
    if (!this.connected) {
      return false;
    }
    try {
      const res = await Models.Game.updateOne({ id: gameId }, game, {
        upsert: true,
        session: options?.session,
      });
      console.log(res);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async createContext(): Promise<ClientSession> {
    const db = mongoose.connection;
    const session = await db.startSession();
    session.startTransaction();
    return session;
  }

  async commitContext(context: ClientSession): Promise<boolean> {
    await context.commitTransaction();
    context.endSession();
    return true;
  }
}
