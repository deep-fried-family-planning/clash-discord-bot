import type {APIInteraction} from 'discord-api-types/v10';
import {respond} from '#src/aws-lambdas/api_discord/api-util.ts';

export const autocomplete = async (body: APIInteraction) => respond({
    status: 200,
    body  : {
        type: body.type,
    },
});
