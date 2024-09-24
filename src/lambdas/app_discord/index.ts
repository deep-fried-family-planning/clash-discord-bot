import {getSecret} from '#src/lambdas/client-aws.ts';
import {tryJson} from '#src/lambdas/util.ts';
import type {AppDiscordEvent} from '#src/lambdas/types-events.ts';
import {initDiscord} from '#src/discord/api/api-discord.ts';
import {api_coc} from '#src/lambdas/client-api-coc.ts';
import type {APIEmbed} from 'discord-api-types/v10';
import {show} from '../../../util.ts';
import {EMBED_COLOR} from '#src/discord/command-util/message-embed.ts';
import {logError} from '#src/api/log-error.ts';
import {COC_PASSWORD, COC_USER, DISCORD_APP_ID} from '#src/constants-secrets.ts';
import {discord, initDiscordClient} from '#src/api/api-discord.ts';
import {dLines} from '#src/discord/command-util/message.ts';
import {getHandlerKey} from '#src/discord/command-pipeline/commands-interaction.ts';
import {COMMAND_HANDLERS} from '#src/discord/command-handlers.ts';
import type {EmbedSpec} from '#src/discord/types.ts';

/**
 * @init
 */
await initDiscordClient();
const discord_app_id = await getSecret(DISCORD_APP_ID);

const email = await getSecret(COC_USER);
const password = await getSecret(COC_PASSWORD);

await api_coc.login({
    email,
    password,
    keyName: `${process.env.LAMBDA_ENV}-app-discord`,
});

await initDiscord();

/**
 * @invoke
 */
export const handler = async (event: AppDiscordEvent) => {
    const body = tryJson(event.Records[0].body);

    try {
        show(body);

        const handlerKey = getHandlerKey(body);

        const message: EmbedSpec[] = await COMMAND_HANDLERS[handlerKey](body);

        await discord.interactions.editReply(discord_app_id, body.token, {
            embeds: message.map((m) => ({
                title      : m.title,
                description: m.desc.join(''),
                color      : EMBED_COLOR,
            } satisfies APIEmbed)),
        });
    }
    catch (e) {
        const error = e as Error;

        await logError(error);

        await discord.interactions.editReply(discord_app_id, body.token, {
            embeds: [{
                title      : 'Error',
                description: dLines([
                    `something went wrong. show this to ryan:`,
                    `\`log group:\` ${process.env.AWS_LAMBDA_LOG_GROUP_NAME}`,
                    `\`instance: \` ${process.env.AWS_LAMBDA_LOG_STREAM_NAME}`,
                ]).join(''),
                color: EMBED_COLOR,
            }],
        });
    }
};
