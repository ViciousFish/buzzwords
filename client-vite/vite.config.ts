import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

// https://vitejs.dev/config/
export default ({ command, mode }) => {
  console.log(mode);
  return defineConfig({
    plugins: [reactRefresh()],
    build: {
      sourcemap: mode !== "production",
      rollupOptions: {
        plugins: [
          {
            name: 'replace-code',
            transform (code, id) {
              if (!/nbind/.test(id)) return
              console.log('replace code')
              code = code.replace('_a = _typeModule(_typeModule),', 'var _a = _typeModule(_typeModule);')
              return {
                code,
                map: { mappings: '' }
              }
            }
          }
      ]
      }
    },
  });
};
