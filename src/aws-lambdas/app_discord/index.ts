import {tryJson} from '#src/utils/try-json.ts';
import {show} from '../../utils/show.ts';
import {discordLogError} from '#src/api/calls/discord-log-error.ts';
import {discord} from '#src/api/api-discord.ts';
import {getHandlerKey} from '#src/discord/command-pipeline/commands-interaction.ts';
import {COMMAND_HANDLERS} from '#src/discord/command-handlers.ts';
import type {Boom} from '@hapi/boom';
import type {AppDiscordEvent} from '#src/aws-lambdas/app_discord/index-app-discord.types.ts';
import {eErrorReply} from '#src/discord/helpers/embed-error-reply.ts';
import {SECRET_DISCORD_APP_ID} from '#src/constants/secrets/secret-discord-app-id.ts';

/**
 * @init
 */

/**
 * @invoke
 */
export const handler = async (event: AppDiscordEvent) => {
    const body = tryJson(event.Records[0].body);

    try {
        show(body);

        const handlerKey = getHandlerKey(body);

        const message = await COMMAND_HANDLERS[handlerKey](body);

        await discord.interactions.editReply(SECRET_DISCORD_APP_ID, body.token, message);
    }
    catch (e) {
        const error = e as Error | Boom;

        const log = await discordLogError(error);

        show(log.contents);

        await discord.interactions.editReply(SECRET_DISCORD_APP_ID, body.token, eErrorReply(error, log));
    }
};
