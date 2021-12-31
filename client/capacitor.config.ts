import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.chuckdries.buzzwords",
  appName: "Buzzwords",
  webDir: "dist",
  bundledWebRuntime: false,
  // server: {
  //   hostname: "buzzwords.gg",
  //   androidScheme: "https",
  // },
};

export default config;
