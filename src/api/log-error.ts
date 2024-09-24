import {getSecret} from '#src/lambdas/client-aws.ts';
import {bindApiCall} from '#src/api/api-call.ts';
import {dLines} from '#src/discord/command-util/message.ts';
import {DISCORD_ERROR_URL} from '#src/constants-secrets.ts';
import {EMBED_COLOR} from '#src/discord/command-util/message-embed.ts';

let url = '';
let errorCall: ReturnType<typeof bindApiCall>;

export const logError = async (error: Error): Promise<{contents: {channel_id: string; id: string}}> => {
    if (url === '') {
        url = await getSecret(DISCORD_ERROR_URL);
        errorCall = bindApiCall(url);
    }

    console.error(error);

    const cloudWatchUrl = `https://${process.env.AWS_REGION}.console.aws.amazon.com/cloudwatch/home?`
        + `region=${process.env.AWS_REGION}`
        + `#logsV2:log-groups/log-group/`
        + encodeURIComponent(process.env.AWS_LAMBDA_LOG_GROUP_NAME)
        + '/log-events/'
        + encodeURIComponent(process.env.AWS_LAMBDA_LOG_STREAM_NAME);

    return await errorCall({
        path    : '',
        method  : 'POST',
        jsonBody: {
            embeds: [{
                title      : process.env.AWS_LAMBDA_FUNCTION_NAME,
                description: dLines([
                    error.name,
                    error.message,
                    '',
                    process.env.AWS_LAMBDA_LOG_GROUP_NAME,
                    process.env.AWS_LAMBDA_LOG_STREAM_NAME,
                    '',
                    cloudWatchUrl,
                ]).join(''),
                color: EMBED_COLOR,
            }],
        },
        query: {
            wait: true,
        },
    });
};
