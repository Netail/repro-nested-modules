import { getWebInstrumentations, initializeFaro } from '@grafana/faro-react';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

const faroCollector =
    'https://faro-collector.grafana.net/collect';
const defaultUrls: Record<string, string> = {
    tst: `${faroCollector}/123456789`,
    acc: `${faroCollector}/123456789`,
};

interface ObservabilityConfig {
    appName: string;
    appVersion: string;
    url?: string;
}

export const initializeObservability = ({
    appName,
    appVersion,
    url,
}: ObservabilityConfig) => {
    if (typeof window === 'undefined') {
        return;
    }

    const hostname = window.location.hostname;
    const env = hostname.includes('tst')
        ? 'tst'
        : hostname.includes('acc')
            ? 'acc'
            : 'prd';

    const finalUrl = url || defaultUrls[env];

    if (!finalUrl) {
        return;
    }

    initializeFaro({
        app: {
            name: appName,
            version: appVersion,
        },
        url: finalUrl,
        instrumentations: [
            ...getWebInstrumentations(),
            new TracingInstrumentation(),
        ],
    });
};
