import reactRefresh from "@vitejs/plugin-react-refresh";
import electron from "vite-plugin-electron";
import { rmSync } from "fs";
import { join } from "path";
import { defineConfig, Plugin, UserConfig } from "vite";
// import pkg from "./package.json";

rmSync("dist", { recursive: true, force: true }); // v14.14.0

// https://vitejs.dev/config/
export default ({ command, mode }) => {
  console.log('dt', process.env.DESKTOP)
  return defineConfig({
    assetsInclude: ['**/*.gltf'],
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8080",
          ws: true,
        },
        "/socket.io": {
          target: "http://localhost:8080",
          ws: true,
        },
      },
    },
    plugins: [
      reactRefresh(),
      process.env.DESKTOP ? electron({
        main: {
          entry: "electron/main/index.ts",
          vite: withDebug({
            build: {
              outDir: "dist/electron/main",
            },
          }),
        },
        preload: {
          input: {
            // You can configure multiple preload here
            index: join(__dirname, "electron/preload/index.ts"),
          },
          vite: {
            build: {
              // For Debug
              sourcemap: "inline",
              outDir: "dist/electron/preload",
            },
          },
        },
        // Enables use of Node.js API in the Renderer-process
        // renderer: {},
      }) : null,
    ],
    build: {
      sourcemap: mode !== "production",
    },
  });
};

function withDebug(config: UserConfig): UserConfig {
  if (process.env.VSCODE_DEBUG) {
    if (!config.build) config.build = {};
    config.build.sourcemap = true;
    config.plugins = (config.plugins || []).concat({
      name: "electron-vite-debug",
      configResolved(config) {
        const index = config.plugins.findIndex(
          (p) => p.name === "electron-main-watcher"
        );
        // At present, Vite can only modify plugins in configResolved hook.
        (config.plugins as Plugin[]).splice(index, 1);
      },
    });
  }
  return config;
}
