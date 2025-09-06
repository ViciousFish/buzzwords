import * as opentelemetry from "@opentelemetry/api";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { MongoDBInstrumentation } from "@opentelemetry/instrumentation-mongodb";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { NodeSDK, logs } from "@opentelemetry/sdk-node";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { BunyanInstrumentation } from "@opentelemetry/instrumentation-bunyan";
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';


export default function initTracing() {
  opentelemetry.diag.setLogger(
    new opentelemetry.DiagConsoleLogger(),
    opentelemetry.DiagLogLevel.WARN
  );

  const apikey = process.env.OTEL_EXPORTER_OTLP_HEADERS;
  if (apikey) {
    const sdk = new NodeSDK({
      traceExporter: new OTLPTraceExporter(),
      logRecordProcessors: [
        new logs.SimpleLogRecordProcessor(new OTLPLogExporter()),
      ],
      instrumentations: [
        getNodeAutoInstrumentations({
          // we recommend disabling fs autoinstrumentation since it can be noisy
          // and expensive during startup
          '@opentelemetry/instrumentation-fs': {
            enabled: false,
          },
        }),
        new ExpressInstrumentation(),
        new MongoDBInstrumentation({
          // TODO figure out why allowing it to serialize causes a stack overflow
          dbStatementSerializer: () => '[Redacted]'
        }),
        new BunyanInstrumentation(),
      ]
    });

    sdk.start();

    process.on('SIGTERM', () => {
      sdk
        .shutdown()
        .finally(() => process.exit(0));
    });
  }
}
