import {eErrorLog} from '#src/discord/helpers/embed-error-log.ts';
import {discord_error} from '#src/https/api-discord-error.ts';
import type {Boom} from '@hapi/boom';

/**
 * @deprecated
 */
export const discordLogError = async (e: unknown) => {
    console.error(e);

    const error = e as Error | Boom;

    return {
        log: (await discord_error({
            path  : '',
            method: 'POST',
            query : {
                wait: true,
            },
            jsonBody: eErrorLog(error),
        })) as {contents: {channel_id: string; id: string}},
        error,
    };
};
