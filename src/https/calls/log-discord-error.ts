import {CFG, E, pipe, RDT} from '#src/internals/re-exports/effect.ts';
import {bindApiCall} from '#src/https/api-call.ts';
import {REDACTED_DISCORD_ERROR_URL} from '#src/internals/constants/secrets.ts';
import {Console} from 'effect';
import {COLOR, nColor} from '#src/internals/constants/colors.ts';
import {dLinesS} from '#src/discord/markdown.ts';
import {mapL} from '#src/pure/pure-list.ts';
import {CMP} from '#src/discord/re-exports.ts';
import {LBUTTON_SUPPORT_SERVER} from '#src/discord/lbutton-support-server.ts';
import {buildCloudWatchLink} from '#src/aws-lambdas/slash/utils.ts';
// import {LBUTTON_ERROR_LOG} from '#src/discord/app-interactions/components/lbutton-error-log.ts';

export const logDiscordError = (e: unknown[]) => E.gen(function * () {
    yield * Console.error('[CAUSE]:', ...e);

    const url = RDT.value(yield * CFG.redacted(REDACTED_DISCORD_ERROR_URL));

    const {contents: log} = yield * E.tryPromise(async () => (await bindApiCall(url)({
        path  : '',
        method: 'POST',
        query : {
            wait: true,
        },
        jsonBody: {
            embeds: [{
                color      : nColor(COLOR.ERROR),
                title      : process.env.AWS_LAMBDA_FUNCTION_NAME,
                description: dLinesS(
                    dLinesS(...pipe(e, mapL((err) => dLinesS(
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        err.name,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        err.message,
                    )))),
                    '',
                    process.env.AWS_LAMBDA_LOG_GROUP_NAME,
                    process.env.AWS_LAMBDA_LOG_STREAM_NAME,

                    buildCloudWatchLink(),
                ),
            }],
        },
    })) as {contents: {channel_id: string; id: string}}).pipe(E.catchAllCause((e) => E.gen(function * () {
        yield * Console.log(e);
        return {contents: {
            channel_id: 'failed',
            id        : 'failed',
        }};
    })));

    return {
        embeds: [{
            color      : nColor(COLOR.ERROR),
            title      : 'Unknown Error',
            description: dLinesS(
                `If you don't think your input caused this error, send this link to the support server:`,
                `-# <https://discord.com/channels/1283847240061947964/${log.channel_id}/${log.id}>`,
            ),
        }],
        components: [{
            type      : CMP.ActionRow,
            components: [
                LBUTTON_SUPPORT_SERVER,
                // LBUTTON_ERROR_LOG(log.channel_id, log.id),
            ],
        }],
    };
});
