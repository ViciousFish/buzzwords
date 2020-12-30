interface Config {
  port: string;
}

export const getConfig = (): Config => {
  return {
    port: process.env.PORT || "8080",
  };
};

export default getConfig;
