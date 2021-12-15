import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

// https://vitejs.dev/config/
export default ({ command, mode }) => {
  console.log(mode);
  return defineConfig({
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8080",
        },
      },
    },
    plugins: [
      {
        name: "replace-code",
        transform(code, id) {
          if (!/nbind/.test(id)) return;
          console.log("replace code");
          code = code.replace(
            "_a = _typeModule(_typeModule),",
            "var _a = _typeModule(_typeModule);"
          );
          return {
            code,
            map: { mappings: "" },
          };
        },
      },
      reactRefresh(),
    ],
    build: {
      sourcemap: mode !== "production",
      // rollupOptions: {
      //   plugins: [],
      // },
    },
  });
};
