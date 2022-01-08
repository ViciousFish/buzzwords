import dotenv from "dotenv";
interface Config {
  port: string;
  dbType: string;
  mongoUrl: string;
  cookieSecret: string;
  cookieDomain: string;
}

export const getConfig = (): Config => {
  dotenv.config();
  return {
    port: process.env.PORT || "8080",
    dbType: process.env.DB_TYPE || "memory",
    mongoUrl: process.env.MONGO_URL || "mongodb://localhost/dev",
    cookieSecret: process.env.COOKIE_SECRET || "CHANGE_ME_IN_PRODUCTION",
    cookieDomain: process.env.COOKIE_DOMAIN || "localhost",
  };
};

export default getConfig;
