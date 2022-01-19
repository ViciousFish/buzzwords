/* eslint-disable @typescript-eslint/no-var-requires */

const { DiagConsoleLogger, DiagLogLevel, diag } = require("@opentelemetry/api");
// import otel dependencies
const opentelemetry = require("@opentelemetry/api");
const { ConsoleLogger } = require("@opentelemetry/core");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
  BatchSpanProcessor,
} = require("@opentelemetry/sdk-trace-base");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const {
  ExpressInstrumentation,
} = require("@opentelemetry/instrumentation-express");
const {
  MongoDBInstrumentation,
} = require("@opentelemetry/instrumentation-mongodb");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-grpc");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const grpc = require("@grpc/grpc-js");
const { Resource } = require("@opentelemetry/resources");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");

module.exports = () => {
  opentelemetry.diag.setLogger(
    new opentelemetry.DiagConsoleLogger(),
    opentelemetry.DiagLogLevel.WARN
  );

  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]:
        process.env.SERVICE_NAME || "buzzwords-api",
    }),
  });

  const metadata = new grpc.Metadata();
  const apikey = process.env.HONEYCOMB_API_KEY;
  const dataset = process.env.HONEYCOMB_DATASET || "otel-nodejs";
  if (apikey) {
    metadata.set("x-honeycomb-team", apikey);
    metadata.set("x-honeycomb-dataset", dataset);
    const creds = grpc.credentials.createSsl();
    provider.addSpanProcessor(
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: "grpc://api.honeycomb.io:443/",
          credentials: creds,
          metadata,
        })
      )
    );

    // uncomment this to see traces in stdout
    // provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

    provider.register();

    // turn on autoinstrumentation for traces you're likely to want
    registerInstrumentations({
      tracerProvider: provider,
      instrumentations: [
        new HttpInstrumentation(),
        new ExpressInstrumentation(),
        new MongoDBInstrumentation(),
      ],
    });

    return opentelemetry.trace.getTracer(
      process.env.SERVICE_NAME || "buzzwords-api"
    );
  }
};
