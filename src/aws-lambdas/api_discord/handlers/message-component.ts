import type {APIMessageComponentInteraction} from 'discord-api-types/v10';
import {respond} from '#src/aws-lambdas/api_discord/api-util.ts';
import {InteractionResponseType} from 'discord-interactions';
import {aws_sqs} from '#src/api/aws-sqs.ts';

export const messageComponent = async (body: APIMessageComponentInteraction) => {
    console.log('event', body);

    await aws_sqs.sendMessage({
        QueueUrl   : process.env.SQS_APP_DISCORD,
        MessageBody: JSON.stringify(body),
    });

    return respond({
        status: 200,
        body  : {
            type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
        },
    });
};
