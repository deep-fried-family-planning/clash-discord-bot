import type {APIInteraction} from '@discordjs/core/http-only';
import {respond} from '#src/aws-lambdas/api_discord/api-util.ts';
import {InteractionResponseType} from 'discord-interactions';
import {aws_sqs} from '#src/https/aws-sqs.ts';

export const applicationCommand = async (body: APIInteraction) => {
    await aws_sqs.sendMessage({
        QueueUrl   : process.env.SQS_SLASH,
        MessageBody: JSON.stringify(body),
    });

    return respond({
        status: 200,
        body  : {
            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        },
    });
};
