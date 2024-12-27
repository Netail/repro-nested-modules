'use client';

import { faro } from '@grafana/faro-web-sdk';
import { initializeObservability } from './initialize';

export const FaroObservability = () => {
    // Skip if faro has been initialized already
    if (faro.api) {
        return null;
    }

    try {
        initializeObservability({
            appName: 'unknown',
            appVersion: '0.0.0',
        });
    } catch {
        return null;
    }

    return null;
};
