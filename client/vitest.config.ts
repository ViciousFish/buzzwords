import { defineConfig } from "vitest/config";

// Standalone Vitest config — does NOT import vite.config.ts to avoid the
// rmSync("dist", ...) side-effect that file executes at module load time.
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
  },
  resolve: {
    // Teach Vitest how to resolve the buzzwords-shared workspace package
    alias: {
      "buzzwords-shared": new URL("../shared", import.meta.url).pathname,
    },
  },
});
