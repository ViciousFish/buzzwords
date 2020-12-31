interface Config {
  port: string;
  dbType: string;
}

export const getConfig = (): Config => {
  return {
    port: process.env.PORT || "8080",
    dbType: process.env.DB_TYPE || "memory",
  };
};

export default getConfig;
