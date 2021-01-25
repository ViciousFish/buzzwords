import dotenv from "dotenv";
interface Config {
  port: string;
  dbType: string;
  pg: {
    host?: string;
    user?: string;
    password?: string;
    port?: string;
    db?: string;
  };
  mongoUrl: string;
}

export const getConfig = (): Config => {
  dotenv.config();
  return {
    port: process.env.PORT || "8080",
    dbType: process.env.DB_TYPE || "memory",
    pg: {
      host: process.env.PG_HOST || "localhost",
      user: process.env.PG_USER || "postgres",
      password: process.env.PG_PASSWORD || "postgres",
      port: process.env.PG_PORT || "5432",
      db: process.env.PG_DB || "postgres",
    },
    mongoUrl: process.env.MONGO_URL || "mongodb://localhost/dev",
  };
};

export default getConfig;
