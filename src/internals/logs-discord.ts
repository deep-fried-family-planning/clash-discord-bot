import {Logger} from '#src/utils/effect.ts';

export const logsDiscord = Logger
    .make(({logLevel, message}) => {
        globalThis.console.log(`[${logLevel.label}] ${message}`);
    });
