import type {APIMessageComponentInteraction} from 'discord-api-types/v10';
import {respond} from '#src/lambdas/api_discord/api-util.ts';

export const messageComponent = (body: APIMessageComponentInteraction) => respond({
    status: 200,
    body  : {},
});
