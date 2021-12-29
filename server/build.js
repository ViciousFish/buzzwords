require("esbuild") // eslint-disable-line
  .build({
    entryPoints: ["./src/index.ts"],
    bundle: true,
    platform: "node",
    outfile: "./dist/index.js",
    sourcemap: true,
    watch: process.env.BUZZ_BUILD_WATCH || false,
    // plugins: require("./plugins"),
  })
  .catch(() => process.exit(1));
