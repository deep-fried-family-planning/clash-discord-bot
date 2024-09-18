import type {APIApplicationCommandInteraction} from 'discord-api-types/v10';
import {respond} from '#src/lambdas/api_discord/api-util.ts';
import {InteractionResponseType} from 'discord-interactions';
import console from 'node:console';
import {aws_sqs} from '#src/lambdas/client-aws.ts';

export const applicationCommand = async (body: APIApplicationCommandInteraction) => {
    console.log('event', body);

    await aws_sqs.sendMessage({
        QueueUrl   : process.env.SQS_APP_DISCORD,
        MessageBody: JSON.stringify(body),
    });

    return respond({
        status: 200,
        body  : {
            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
            // data: {
            //     content: 'fetching...',
            // },
        },
    });
};
