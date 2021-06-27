import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

// https://vitejs.dev/config/
export default ({ command, mode }) => {
  console.log(mode);
  return defineConfig({
    plugins: [reactRefresh()],
    build: {
      sourcemap: mode !== "production",
    },
  });
};
