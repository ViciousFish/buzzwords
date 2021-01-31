import dotenv from "dotenv";
interface Config {
  port: string;
  dbType: string;
  mongoUrl: string;
}

export const getConfig = (): Config => {
  dotenv.config();
  return {
    port: process.env.PORT || "8080",
    dbType: process.env.DB_TYPE || "memory",
    mongoUrl: process.env.MONGO_URL || "mongodb://localhost/dev",
  };
};

export default getConfig;
