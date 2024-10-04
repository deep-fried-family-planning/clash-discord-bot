import {tryJson} from '#src/utils/try-json.ts';
import {show} from '../../utils/show.ts';
import {discordLogError} from '#src/https/calls/discord-log-error.ts';
import {discord} from '#src/https/api-discord.ts';
import {getHandlerKey} from '#src/discord/command-pipeline/commands-interaction.ts';
import {COMMAND_HANDLERS} from '#src/discord/command-handlers.ts';
import type {AppDiscordEvent} from '#src/aws-lambdas/app_discord/index-app-discord.types.ts';
import {eErrorReply} from '#src/discord/helpers/embed-error-reply.ts';
import {SECRET_DISCORD_APP_ID} from '#src/constants/secrets/secret-discord-app-id.ts';
import {ITR, MSG} from '#src/discord/helpers/re-exports.ts';
import {INTERACTIONS} from '#src/discord/app-interactions/interactions.ts';
import {asBoom} from '#src/utils/as-boom.ts';
import {E, Logger} from '#src/utils/effect.ts';
import {SSM_GET} from '#src/effect-aws/ssm.ts';
import {makeLambda} from '@effect-aws/lambda';
import {invokeCount, showMetric, SSM_counter} from '#src/internals/metrics.ts';

/**
 * @invoke
 */
export const ope = async (event: AppDiscordEvent) => {
    const body = tryJson(event.Records[0].body);

    try {
        show(body);

        if (body.type === ITR.ApplicationCommand) {
            const handlerKey = getHandlerKey(body);

            const message = await COMMAND_HANDLERS[handlerKey](body);

            await discord.interactions.editReply(SECRET_DISCORD_APP_ID, body.token, message);
        }
        else {
            await INTERACTIONS[body.type][body.data.custom_id](body);
        }
    }
    catch (e) {
        const error = asBoom(e);

        const log = await discordLogError(error);

        show(log.log.contents);

        try {
            await discord.interactions.editReply(SECRET_DISCORD_APP_ID, body.token, eErrorReply(error, log.log));
        }
        catch (_) {
            await discord.interactions.reply(body.id, body.token, {
                flags: MSG.Ephemeral,
                ...eErrorReply(error, log.log),
            });
        }
    }
};

const h = (event: AppDiscordEvent) => E.gen(function* () {
    const ssm = yield * SSM_GET;

    yield * showMetric(SSM_counter);
    yield * showMetric(invokeCount);

    yield * E.promise(async () => {
        await ope(event);
    });
});

export const handler = makeLambda(h, Logger.replace(Logger.defaultLogger, Logger.structuredLogger));
