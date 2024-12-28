// import dotenv from "dotenv";
// dotenv.config();
// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const tracer = require("./tracing")();

// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const server = require("./server").default;
// server();

import { Server, Origins } from "boardgame.io/server";
import { Buzzwords } from "buzzwords-shared/Buzzwords";

const server = Server({
  games: [Buzzwords],
  origins: [Origins.LOCALHOST],
});

server.run(8000);
