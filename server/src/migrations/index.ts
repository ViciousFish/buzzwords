import mongoose from "mongoose";
import getConfig from "../config";
import Models from "../datalayer/mongo/models";

import Migration0 from "./0";
import Migration1 from "./1";

/**
 * To add another migration, create the subsequent <number>.ts
 * Export a function that will run the needed changes
 * Import the function here and add it to the list below
 */

const migrations = [Migration0, Migration1];

export default () => {
  return new Promise((resolve, reject) => {
    const config = getConfig();
    mongoose.connect(config.mongoUrl, {});
    const db = mongoose.connection;
    db.on("open", async () => {
      console.log("Connected to db!");
      const session = await db.startSession();
      session.startTransaction();
      const result = await Models.Migration.find({}, {}, { session });

      const maxMigration = result.reduce((max, current) => {
        if (current.version > max) {
          return current.version;
        }
        return max;
      }, -1);
      console.log(
        "🚀 ~ file: index.ts ~ line 32 ~ maxMigration ~ maxMigration",
        maxMigration
      );

      for (let idx = 0; idx < migrations.length; idx++) {
        if (idx > maxMigration) {
          console.log("Running migration: ", idx);
          await migrations[idx](session);
          await Models.Migration.create(
            [
              {
                version: idx,
              },
            ],
            {
              session,
            }
          );
        }
      }

      await session.commitTransaction();
      session.endSession();
      resolve(null);
    });
  });
};
