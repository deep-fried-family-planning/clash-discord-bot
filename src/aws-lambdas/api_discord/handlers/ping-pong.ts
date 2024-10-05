import type {APIInteraction} from '@discordjs/core/http-only';
import {respond} from '#src/aws-lambdas/api_discord/api-util.ts';

export const pingPong = (body: APIInteraction) => respond({
    status: 200,
    body  : {
        type: body.type,
    },
});
