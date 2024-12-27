import type { IncomingMessage } from 'node:http';
import { context } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { RPCType, getRPCMetadata, setRPCMetadata } from '@opentelemetry/core';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { HostMetrics } from '@opentelemetry/host-metrics';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { RuntimeNodeInstrumentation } from '@opentelemetry/instrumentation-runtime-node';
import {
    Resource,
    detectResourcesSync,
    envDetector,
    hostDetector,
    processDetector,
} from '@opentelemetry/resources';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import {
    BatchSpanProcessor,
    NodeTracerProvider,
    type SpanExporter,
} from '@opentelemetry/sdk-trace-node';
import {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

context.setGlobalContextManager(new AsyncLocalStorageContextManager());

const metricsExporter = new PrometheusExporter({
    port: 9464,
});
const tracesExporter = new OTLPTraceExporter({
    url: 'https://otel.localhost:443',
});

const detectedResources = detectResourcesSync({
    detectors: [envDetector, processDetector, hostDetector],
});

const customResources = new Resource({
    [ATTR_SERVICE_NAME]: 'unknown',
    [ATTR_SERVICE_VERSION]: '0.0.0',
});
const resources = customResources.merge(detectedResources);

const meterProvider = new MeterProvider({
    resource: resources,
    readers: [metricsExporter],
});

const hostMetrics = new HostMetrics({
    name: `${process.env.NEXT_PUBLIC_CLIENT}-metrics`,
    meterProvider,
});

const tracerProvider = new NodeTracerProvider({
    resource: resources,
    spanProcessors: [
        new BatchSpanProcessor(tracesExporter as SpanExporter, {
            // The maximum queue size. After the size is reached spans are dropped.
            maxQueueSize: 100,
            // The maximum batch size of every export. It must be smaller or equal to maxQueueSize.
            maxExportBatchSize: 10,
            // The interval between two consecutive exports
            scheduledDelayMillis: 500,
            // How long the export can run before it is cancelled
            exportTimeoutMillis: 30000,
        }),
    ],
});

registerInstrumentations({
    tracerProvider,
    meterProvider,
    instrumentations: [
        new HttpInstrumentation({
            requestHook: (span, request) => {
                // We only want the path to prevent making to many buckets in prometheus
                const route = (request as IncomingMessage)?.url?.split('?')[0];
                if (
                    route &&
                    (route.endsWith('.json') || !route.includes('.'))
                ) {
                    // Try to apply the route only for pages and client side fetches
                    const rpcMetadata = getRPCMetadata(context.active()); // retrieve rpc metadata from the active context
                    if (rpcMetadata?.type === RPCType.HTTP) {
                        rpcMetadata.route = route;
                    } else {
                        setRPCMetadata(context.active(), {
                            type: RPCType.HTTP,
                            route,
                            span,
                        });
                    }
                }
            },
        }),
        new RuntimeNodeInstrumentation(),
    ],
});

tracerProvider.register();
hostMetrics.start();
