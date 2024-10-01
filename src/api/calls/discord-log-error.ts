import {eErrorLog} from '#src/discord/helpers/embed-error-log.ts';
import {discord_error} from '#src/api/api-discord-error.ts';

export const discordLogError = async (error: Error): Promise<{contents: {channel_id: string; id: string}}> => {
    console.error(error);

    return await discord_error({
        path  : '',
        method: 'POST',
        query : {
            wait: true,
        },
        jsonBody: eErrorLog(error),
    });
};
