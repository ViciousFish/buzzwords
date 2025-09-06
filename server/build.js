require("esbuild") // eslint-disable-line
  .build({
    entryPoints: ["./src/index.ts"],
    bundle: true,
    platform: "node",
    outfile: "./dist/index.js",
    sourcemap: true,
    watch: Boolean(process.env.BUZZ_BUILD_WATCH) || false,
    external: [
      "http",
      "express",
      "mongodb",
      "@opentelemetry/api",
      "@opentelemetry/core",
      "@opentelemetry/sdk-trace-node",
      "@opentelemetry/sdk-trace-base",
      "@opentelemetry/instrumentation-http",
      "@opentelemetry/instrumentation-express",
      "@opentelemetry/instrumentation-mongodb",
      "@opentelemetry/exporter-trace-otlp-grpc",
      "@opentelemetry/instrumentation",
      "@grpc/grpc-js",
      "@opentelemetry/resources",
      "@opentelemetry/semantic-conventions",
      "@opentelemetry/auto-instrumentations-node",
      "@opentelemetry/instrumentation-bunyan",
      "@opentelemetry/instrumentation-fs",
      "@opentelemetry/sdk-node",
      "@opentelemetry/exporter-logs-otlp-http"
    ],
    // plugins: require("./plugins"),
  })
  .catch(() => process.exit(1));
