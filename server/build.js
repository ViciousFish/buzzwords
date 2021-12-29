require("esbuild") // eslint-disable-line
  .build({
    entryPoints: ["./src/index.ts"],
    bundle: true,
    platform: "node",
    outfile: "./dist/index.js",
    sourcemap: true,
    // plugins: require("./plugins"),
  })
  .catch(() => process.exit(1));
