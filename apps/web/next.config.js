/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: [
        '@opentelemetry/instrumentation',
        '@opentelemetry/instrumentation-runtime-node'
    ],
    transpilePackages: [
        '@repo/client-observability',
        '@repo/server-observability',
    ]
};

export default nextConfig;
