import mongoose, { ClientSession } from "mongoose";
import getConfig from "../../config";

import { AuthToken, DataLayer, User } from "../../types";
import { withRetry } from "../../util";
import Game from "buzzwords-shared/Game";
import Models from "./models";

import { performance } from "perf_hooks";

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

  async createUser(id: string, options?: Options): Promise<User> {
    if (!this.connected) {
      throw new Error("Db not connected");
    }
    try {
      const res = await Models.User.create(
        [
          {
            id,
          },
        ],
        {
          session: options?.session,
        }
      );
      return res[0].toObject();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async deleteUser(id: string, options?: Options): Promise<boolean> {
    if (!this.connected) {
      throw new Error("Db not connected");
    }
    try {
      const res = await Models.User.deleteOne(
        {
          id,
        },
        {
          session: options?.session,
        }
      );
      return res.deletedCount === 1;
    } catch (e) {
      console.log(e);
      throw e;
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
      const res = await Models.AuthToken.create(
        [
          {
            token,
            userId,
          },
        ],
        {
          session: options?.session,
        }
      );
      return true;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async deleteAuthToken(token: string, options?: Options): Promise<boolean> {
    if (!this.connected) {
      throw new Error("Db not connected");
    }
    try {
      const res = await Models.AuthToken.updateOne(
        {
          token,
        },
        {
          deleted: true,
        },
        {
          session: options?.session,
        }
      );
      return true;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async setAuthTokenState(
    token: string,
    state: string,
    options?: Options
  ): Promise<boolean> {
    if (!this.connected) {
      throw new Error("Db not connected");
    }
    try {
      const res = await Models.AuthToken.findOneAndUpdate(
        {
          token,
        },
        {
          state,
        },
        {
          session: options?.session,
        }
      );
      return true;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async getAuthTokenByState(
    state: string,
    options?: Options
  ): Promise<AuthToken | null> {
    if (!this.connected) {
      throw new Error("Db not connected");
    }
    try {
      const res = await Models.AuthToken.findOne(
        {
          state,
        },
        null,
        {
          session: options?.session,
        }
      );
      return res ? res?.toObject() : null;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async assumeUser(
    assumeeId: string,
    assumerId: string,
    options?: Options
  ): Promise<boolean> {
    if (!this.connected) {
      throw new Error("Db not connected");
    }
    try {
      await Models.Game.updateMany(
        {
          users: assumeeId,
        },
        {
          $set: {
            "users.$[element]": assumerId,
          },
        },
        {
          arrayFilters: [
            {
              element: {
                $eq: assumeeId,
              },
            },
          ],
          session: options?.session,
        }
      );

      await Models.AuthToken.updateMany(
        {
          userId: assumeeId,
        },
        {
          userId: assumerId,
        },
        {
          session: options?.session,
        }
      );
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
          $or: [
            {
              deleted: false,
            },
            {
              deleted: {
                $exists: false,
              },
            },
          ],
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

  async getUserById(id: string, options?: Options): Promise<User | null> {
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
      return res.toObject();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async getUserByGoogleId(
    googleId: string,
    options?: Options
  ): Promise<User | null> {
    if (!this.connected) {
      throw new Error("Db not connected");
    }
    try {
      const res: any = await Models.User.findOne(
        {
          googleId,
        },
        null,
        {
          session: options?.session,
        }
      );
      if (!res) {
        return null;
      }
      return res.toObject();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async setUserGoogleId(
    id: string,
    googleId: string,
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
          googleId,
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

  async getNickNames(
    ids: string[],
    options: Options
  ): Promise<{ [key: string]: string | null }> {
    if (!this.connected) {
      throw new Error("Db not connected");
    }
    try {
      const res = await Models.User.find(
        {
          id: {
            $in: ids,
          },
        },
        null,
        {
          session: options?.session,
        }
      );
      const nicknames: { [key: string]: string | null } = {};
      for (const user of res) {
        nicknames[user.id] = user.nickname || null;
      }
      return nicknames;
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
      const qstart = performance.now();
      const res = await Models.Game.find(
        {
          users: id,
          $or: [
            {
              deleted: false,
            },
            {
              deleted: {
                $exists: false,
              },
            },
          ],
        },
        null,
        {
          session: options?.session,
        }
      ).lean();
      console.log("[perf] refresh query took", performance.now() - qstart);
      const start = performance.now();
      const games = [] as Game[];
      for (const doc of res) {
        // const game = doc.toObject({ flattenMaps: true });
        games.push(doc);
        // game.grid = Object.fromE
      }
      console.log(
        `[perf] flattening ${res.length} games took`,
        performance.now() - start
      );
      return games;

      // return res.map((d) => {
      //   const game = d?.toObject();
      //   // @ts-expect-error I promise this works
      //   game.grid = Object.fromEntries(game.grid);
      //   game.grid = Object.fromEntries(
      //     // @ts-expect-error This also works
      //     Object.entries(game.grid).map(([k, v]) => [k, v.toObject()])
      //   );
      //   return game;
      // });
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
      const game = res.toObject({ flattenMaps: true });
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
          $set: { updatedDate: new Date() },
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
          $set: { updatedDate: new Date() },
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
    game.updatedDate = new Date();
    try {
      const res = await Models.Game.updateOne({ id: gameId }, game, {
        upsert: true,
        session: options?.session,
      });
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
