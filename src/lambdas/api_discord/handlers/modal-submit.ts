import type {APIModalSubmitInteraction} from 'discord-api-types/v10';
import {respond} from '#src/lambdas/api_discord/api-util.ts';

export const modalSubmit = (body: APIModalSubmitInteraction) => respond({
    status: 200,
    body  : {},
});
