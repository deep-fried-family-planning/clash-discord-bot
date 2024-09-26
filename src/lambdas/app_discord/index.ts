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
import {dCode, dLines} from '#src/discord/command-util/message.ts';
import {getHandlerKey} from '#src/discord/command-pipeline/commands-interaction.ts';
import {COMMAND_HANDLERS} from '#src/discord/command-handlers.ts';

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

        const message = await COMMAND_HANDLERS[handlerKey](body);

        await discord.interactions.editReply(discord_app_id, body.token, {
            ...message,
            embeds: message.embeds!.map((m) => ({
                ...m,
                color: EMBED_COLOR,
            } satisfies APIEmbed)),
        });
    }
    catch (e) {
        const error = e as Error;

        const log = await logError(error);

        show(log.contents);

        await discord.interactions.editReply(discord_app_id, body.token, {
            embeds: [{
                title      : 'Error',
                description: dLines([
                    error.message,
                    '',
                    `send this link to <@644290645350940692> (${dCode('yourguyryry')}) for debugging:`,
                    `<https://discord.com/channels/1283847240061947964/${log.contents.channel_id}/${log.contents.id}>`,
                ]).join(''),
            }],
        });
    }
};
