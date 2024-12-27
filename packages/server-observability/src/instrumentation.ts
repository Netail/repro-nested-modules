/**
 * Mount custom open-telemetry on the server (production only)
 */
export const registerOTel = async () => {
    if (
        process.env.NEXT_RUNTIME === 'nodejs'
    ) {
        await import('./instrumentation-node');
    }
};
