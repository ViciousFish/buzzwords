import { ClientSession } from "mongoose";
import Models from "../datalayer/mongo/models";

export default async (session: ClientSession) => {
  await Models.Game.updateMany(
    {},
    {
      size: "medium",
    },
    {
      session,
    }
  );
};
