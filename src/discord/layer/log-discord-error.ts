import {CFG, CSL, E, pipe, RDT} from '#src/internal/pure/effect.ts';
import {REDACTED_DISCORD_ERROR_URL} from '#src/internal/constants/secrets.ts';
import {COLOR, nColor} from '#src/internal/constants/colors.ts';
import {dLinesS} from '#src/discord/util/markdown.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {IXCBS, IXCT} from '#src/discord/util/discord.ts';
import {buildCloudWatchLink} from '#src/discord/util/validation.ts';
import {inspect} from 'node:util';
import {UI} from 'dfx';
import {BackB} from '#src/discord/ixc/components/global-components.ts';
import {OmbiBoardB} from '#src/discord/ixc/view-reducers/omni-board.ts';


export const logDiscordError = (e: unknown[]) => E.gen(function * () {
    yield * CSL.error('[CAUSE]:', ...e.map((e) => inspect(e, true, null)));

    const url = RDT.value(yield * CFG.redacted(REDACTED_DISCORD_ERROR_URL));

    const [token, id] = url.split('/').reverse();

    const log = yield * DiscordApi.executeWebhookJson(id, token, {
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
                    err.e,
                )))),
                '',
                process.env.AWS_LAMBDA_LOG_GROUP_NAME,
                process.env.AWS_LAMBDA_LOG_STREAM_NAME,

                buildCloudWatchLink(),
            ),
        }],
    });

    return {
        embeds: [{
            color      : nColor(COLOR.ERROR),
            title      : 'Unknown Error',
            description: dLinesS(
                `If you don't think your input caused this error, send this link to the support server:`,
                `-# <https://discord.com/channels/1283847240061947964/${log.channel_id}/${log.id}>`,
            ),
            footer: {
                text: 'Made with ❤️ by NotStr8DontH8 and DFFP.',
            },
        }],
        components: UI.grid([
            [
                {
                    type : IXCT.BUTTON,
                    style: IXCBS.LINK,
                    label: 'Support Server',
                    url  : 'https://discord.gg/KfpCtU2rwY',
                },
            ],
            [
                BackB.as(OmbiBoardB.id, {
                    label: 'Restart Omni Board',
                }).component,
                {
                    type     : IXCT.BUTTON,
                    style    : IXCBS.SECONDARY,
                    custom_id: '/k/CLOSE/t/T',
                    label    : 'Close',
                },
            ],
        ]),
    };
});
