import {getSecret} from '#src/lambdas/client-aws.ts';
import {tryJson} from '#src/lambdas/util.ts';
import type {AppDiscordEvent} from '#src/lambdas/types-events.ts';
import {callDiscord, initDiscord} from '#src/discord/api/api-discord.ts';
import {InteractionResponseType} from 'discord-interactions';
import {api_coc} from '#src/lambdas/client-api-coc.ts';
import console from 'node:console';
import type {APIApplicationCommandInteraction, APIEmbed} from 'discord-api-types/v10';
import {show} from '../../../util.ts';
import {authDiscord} from '#src/discord/api/auth-discord.ts';
import {COMMAND_HANDLERS} from '#src/discord/command-handlers.ts';
import {pipe} from 'fp-ts/function';
import {reduce} from 'fp-ts/ReadonlyArray';
import type {IDKV} from '#src/data/types.ts';
import type {buildCommand, EmbedSpec} from '#src/discord/types.ts';
import {EMBED_COLOR} from '#src/discord/command-util/message-embed.ts';
import {logError} from '#src/api/log-error.ts';
import {COC_PASSWORD, COC_USER} from '#src/constants-secrets.ts';
import * as process from 'node:process';

/**
 * @init
 */
const init = (async () => {
    const email = await getSecret(COC_USER);
    const password = await getSecret(COC_PASSWORD);

    await api_coc.login({
        email,
        password,
        keyName: `${process.env.LAMBDA_ENV}-app-discord`,
    });

    return await initDiscord();
})();

const commands = pipe(COMMAND_HANDLERS, reduce({} as IDKV<ReturnType<typeof buildCommand>[1]>, (acc, [name, cmd]) => {
    acc[name] = cmd;
    return acc;
}));

/**
 * @invoke
 */
export const handler = async (event: AppDiscordEvent) => {
    const discord = await init;

    let auth: Awaited<ReturnType<typeof authDiscord>>,
        body: APIApplicationCommandInteraction;

    try {
        body = tryJson(event.Records[0].body);

        show(body);

        auth = await authDiscord(discord.client_id, discord.client_secret, 'identify');

        const message: EmbedSpec[] = await commands[body.data.name](body);

        await callDiscord({
            method  : 'PATCH',
            path    : `/webhooks/${discord.app_id}/${body.token}/messages/@original`,
            bearer  : auth.access_token,
            jsonBody: {
                type  : InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                embeds: message.map((m) => ({
                    title      : m.title,
                    description: m.desc.join(''),
                    color      : EMBED_COLOR,
                } satisfies APIEmbed)),
            }},
        );
    }
    catch (e) {
        const error = e as Error;

        console.error(error);
        await logError(error);

        await callDiscord({
            method  : 'PATCH',
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            path    : `/webhooks/${discord.app_id}/${body.token}/messages/@original`,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            bearer  : auth.access_token,
            jsonBody: {
                type   : InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                content: `something went wrong. show this to ryan:\n`
                + `\`log group:      \` ${process.env.AWS_LAMBDA_LOG_GROUP_NAME}\n`
                + `\`lambda instance:\` ${process.env.AWS_LAMBDA_LOG_STREAM_NAME}\n`,
            },
        });
    }
};
