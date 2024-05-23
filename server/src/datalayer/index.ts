import Memory from "./memory";
import Mongo from "./mongo";
import getConfig from "../config";

import { DataLayer } from "../types";

const config = getConfig();

let dl: DataLayer;
switch (config.dbType) {
  case "memory":
    dl = new Memory();
    break;

  case "mongo":
    dl = new Mongo();
    break;

  case "prisma":
    dl = new Memory();
    break;

  default:
    console.error("Invalid dbType", config.dbType);
    process.exit(1);
}

export default dl;
