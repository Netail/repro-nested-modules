# Repro nested node_modules

1. Install packages using `yarn install`
2. Run the web app `yarn dev`
3. Observe `[TypeError: this.getDefaultUrl is not a function]` being thrown

## Cause

The error itself seems to come from the file `OTLPExporterBase.js` in the `@opentelemetry/otlp-exporter-base` package.

## Why?

In the `packages/client-observability` package we use `@grafana/faro-web-tracing`, which under water uses `@opentelemetry/otlp-exporter-base` version v0.53.0

In the `packages/server-observability` package we use `@opentelemetry/otlp-grpc-exporter-base`, which under water uses `@opentelemetry/otlp-exporter-base` version v0.57.0

Since v0.54.0 the getDefaultUrl has been removed / replaced. Each have their own version installed somewhere in the `node_modules`, so each should target their own version.

v0.53.0 is located directly node_modules folder (`node_modules/@opentelemetry/otlp-exporter-base`) and v0.57.0 is located in a nested node_modules folder (`node_modules/@opentelemetry/otlp-grpc-exporter-base/node_modules/@opentelemetry/otlp-exporter-base`). For some reason, bundling seems to be taking v0.57.0 in both cases. Throwing the error for the packages which should use v0.53.0.

If I revert the 0.57.0 versions in the server-observability package, the dev server starts fine
