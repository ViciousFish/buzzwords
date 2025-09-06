import dotenv from "dotenv";
dotenv.config();
import initTracing from "./tracing";
initTracing();
import server from "./server";
server();