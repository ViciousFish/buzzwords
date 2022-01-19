import dotenv from "dotenv";
dotenv.config();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tracer = require("./tracing")();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const server = require("./server").default;
server();
