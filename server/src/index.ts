import dotenv from "dotenv";
dotenv.config();
import initTracing from "./tracing";
initTracing();

setTimeout(() => {
  import("./server").then((server) => {
    server.default();
  });
}, 10);
