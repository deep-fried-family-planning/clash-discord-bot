import {getSecret} from '#src/lambdas/client-aws.ts';
import {bindApiCall} from '#src/api/api-call.ts';
import {dLines} from '#src/discord/command-util/message.ts';
import {DISCORD_ERROR_URL} from '#src/constants-secrets.ts';
import {EMBED_COLOR} from '#src/discord/command-util/message-embed.ts';

let url = '';
let errorCall: ReturnType<typeof bindApiCall>;

export const logError = async (error: Error) => {
    if (url === '') {
        url = await getSecret(DISCORD_ERROR_URL);
        errorCall = bindApiCall(url);
    }

    console.error(error);

    await errorCall({
        path    : '',
        method  : 'POST',
        jsonBody: {
            embeds: [{
                title      : process.env.AWS_LAMBDA_FUNCTION_NAME,
                description: dLines([
                    process.env.AWS_LAMBDA_LOG_GROUP_NAME,
                    process.env.AWS_LAMBDA_LOG_STREAM_NAME,
                ]).join(''),
                color: EMBED_COLOR,
            }, {
                description: dLines([
                    error.name,
                    error.message,
                ]).join(''),
                color: EMBED_COLOR,
            }, {
                description: error.stack,
                color      : EMBED_COLOR,
            }, error.cause && {
                description: error.cause,
                color      : EMBED_COLOR,
            }].filter(Boolean),
        },
    });
};
