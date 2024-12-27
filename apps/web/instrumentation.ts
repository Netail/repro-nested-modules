import { registerOTel } from '@repo/server-observability/src/instrumentation';

export const register = async () => {
    registerOTel();
};
