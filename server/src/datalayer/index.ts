import Memory from "./memory";
import Mongo from "./mongo";
import getConfig, { DbType } from "../config";

import { DataLayer } from "../types";

const config = getConfig();

let dl: DataLayer;
switch (config.dbType) {
  case DbType.Memory:
    dl = new Memory();
    break;

  case DbType.Mongo:
    dl = new Mongo();
    break;

  case DbType.Edgedb:
    console.log("edge!");
    dl = new Memory();
    break;

  case DbType.Prisma:
    dl = new Memory();
    break;

  default:
    console.error("Invalid dbType", config.dbType);
    process.exit(1);
}

export default dl;
