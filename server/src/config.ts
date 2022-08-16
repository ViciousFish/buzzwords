import dotenv from "dotenv";
interface Config {
  port: string;
  dbType: string;
  mongoUrl: string;
  mongoDbName: string;
  cookieSecret: string;
  cookieDomain: string;
  maxActiveGames: number;
  googleClientId?: string;
  googleClientSecret?: string;
  apiPrefix: string;
  googleCallbackUrl: string;
  appleClientId?: string;
  appleTeamId?: string;
  appleCallbackUrl?: string;
  appleKeyId?: string;
  applePrivateKeyLocation?: string;
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
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    apiPrefix: process.env.API_PREFIX || "",
    googleCallbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      "https://buzzwords.gg/api/login/google/redirect",
    appleClientId: process.env.APPLE_CLIENT_ID || "",
    appleTeamId: process.env.APPLE_TEAM_ID || "",
    appleCallbackUrl:
      process.env.APPLE_CALLBACK_URL ||
      "https://buzzwords.gg/api/login/apple/redirect",
    appleKeyId: process.env.APPLE_KEY_ID || "",
    applePrivateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION || "",
  };
};

export default getConfig;
