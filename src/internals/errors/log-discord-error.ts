import {CFG, E, pipe, RDT} from '#src/internals/re-exports/effect.ts';
import {REDACTED_DISCORD_ERROR_URL} from '#src/internals/constants/secrets.ts';
import {Console} from 'effect';
import {COLOR, nColor} from '#src/internals/constants/colors.ts';
import {dLinesS} from '#src/aws-lambdas/discord_menu/old/markdown.ts';
import {mapL} from '#src/pure/pure-list.ts';
import {CMP} from '#src/aws-lambdas/discord_menu/old/re-exports.ts';
import {LBUTTON_SUPPORT_SERVER} from '#src/aws-lambdas/discord_menu/old/lbutton-support-server.ts';
import {buildCloudWatchLink} from '#src/aws-lambdas/discord_slash/utils.ts';
import {DiscordREST} from 'dfx';

export const logDiscordError = (e: unknown[]) => E.gen(function * () {
    yield * Console.error('[CAUSE]:', ...e);

    const url = RDT.value(yield * CFG.redacted(REDACTED_DISCORD_ERROR_URL));

    const [token, id] = url.split('/').reverse();

    const discord = yield * DiscordREST;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const log = yield * discord.executeWebhook(id, token,
        {
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
        {
            urlParams: {
                wait: true,
            },
        },
    ).json;

    return {
        embeds: [{
            color      : nColor(COLOR.ERROR),
            title      : 'Unknown Error',
            description: dLinesS(
                `If you don't think your input caused this error, send this link to the support server:`,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                `-# <https://discord.com/channels/1283847240061947964/${log.channel_id}/${log.id}>`,
            ),
        }],
        components: [{
            type      : CMP.ACTION_ROW,
            components: [
                LBUTTON_SUPPORT_SERVER,
                // LBUTTON_ERROR_LOG(log.channel_id, log.id),
            ],
        }],
    };
});
