import { ClientSession } from "mongoose";
import Models from "../datalayer/mongo/models";

export default async (session: ClientSession) => {
  await Models.Game.updateMany(
    {
      deleted: {
        $exists: false,
      },
    },
    {
      deleted: false,
    },
    {
      session,
    }
  );
  await Models.AuthToken.updateMany(
    {
      deleted: {
        $exists: false,
      },
    },
    {
      deleted: false,
    },
    {
      session,
    }
  );
};
