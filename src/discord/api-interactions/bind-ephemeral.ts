import {asBoom} from '#src/utils/as-boom.ts';
import type {DModal, IComponent, IModal} from '#src/discord/helpers/re-export-types.ts';
import {INTERACTIONS} from '#src/discord/app-interactions/interactions.ts';
import {discord_itr} from '#src/https/api-discord.ts';
import {SECRET_DISCORD_APP_ID} from '#src/constants/secrets/secret-discord-app-id.ts';
import {eErrorReply} from '#src/discord/helpers/embed-error-reply.ts';
import {discordLogError} from '#src/https/calls/discord-log-error.ts';
import {p, E} from '#src/utils/effect.ts';
import type {APIInteractionResponseCallbackData} from 'discord-api-types/v10';

export const bindEphemeral = async (body) => {
    try {
        const message = await INTERACTIONS[body.type][body.data.custom_id](body);

        await discord_itr
            .editReply(SECRET_DISCORD_APP_ID, body.token, message);
    }
    catch (e) {
        const error = asBoom(e);

        const log = await discordLogError(error);

        await discord_itr
            .editReply(body.application_id, body.token, eErrorReply(error, log.log));
    }
};
