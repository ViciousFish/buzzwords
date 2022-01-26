import dotenv from "dotenv";
interface Config {
  port: string;
  dbType: string;
  mongoUrl: string;
  mongoDbName: string;
  cookieSecret: string;
  cookieDomain: string;
  maxActiveGames: number;
}

export const getConfig = (): Config => {
  dotenv.config();
  return {
    port: process.env.PORT || "8080",
    dbType: process.env.DB_TYPE || "memory",
    mongoUrl: process.env.MONGO_URL || "mongodb://localhost/dev",
    mongoDbName: process.env.MONGO_DB_NAME || "buzzwords",
    cookieSecret: process.env.COOKIE_SECRET || "CHANGE_ME_IN_PRODUCTION",
    cookieDomain: process.env.COOKIE_DOMAIN || "localhost",
    maxActiveGames: parseInt(process.env.MAX_ACTIVES_GAMES || "25"),
  };
};

export default getConfig;
