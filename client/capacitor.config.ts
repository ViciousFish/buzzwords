import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "gg.buzzwords.htmlclient",
  appName: "Buzzwords",
  webDir: "dist",
  bundledWebRuntime: false,
  // server: {
  //   hostname: "buzzwords.gg",
  //   androidScheme: "https",
  // },
};

export default config;
