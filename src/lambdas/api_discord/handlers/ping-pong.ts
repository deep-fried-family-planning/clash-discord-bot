import type {APIPingInteraction} from 'discord-api-types/v10';
import {respond} from '#src/lambdas/api_discord/api-util.ts';

export const pingPong = (body: APIPingInteraction) => respond({
    status: 200,
    body  : {
        type: body.type,
    },
});
