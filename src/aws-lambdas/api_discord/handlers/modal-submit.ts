import type {APIInteraction} from '@discordjs/core';
import {respond} from '#src/aws-lambdas/api_discord/api-util.ts';
import {aws_sqs} from '#src/https/aws-sqs.ts';
import {InteractionResponseType} from 'discord-interactions';

export const modalSubmit = async (body: APIInteraction) => {
    await aws_sqs.sendMessage({
        QueueUrl   : process.env.SQS_APP_DISCORD,
        MessageBody: JSON.stringify(body),
    });

    return respond({
        status: 200,
        body  : {
            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        },
    });
};
