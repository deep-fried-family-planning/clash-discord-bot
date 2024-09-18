import {getSecret} from '#src/lambdas/client-aws.ts';
import {bindApiCall} from '#src/api/api-call.ts';
import {dLines} from '#src/discord/command-util/message.ts';
import {DISCORD_ERROR_URL} from '#src/constants-secrets.ts';

let url = '';
let errorCall: ReturnType<typeof bindApiCall>;

export const logError = async (error: Error) => {
    if (url === '') {
        url = await getSecret(DISCORD_ERROR_URL);
        errorCall = bindApiCall(url);
    }

    await errorCall({
        path    : '',
        method  : 'POST',
        jsonBody: {
            content: dLines([
                error.name,
                error.message,
                error.stack as string,
                error.cause as string,
            ]).join(''),
        },
    });
};
