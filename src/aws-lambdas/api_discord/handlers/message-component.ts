import type {APIInteraction} from 'discord-api-types/v10';
import {aws_sqs} from '#src/https/aws-sqs.ts';

export const messageComponent = async (body: APIInteraction) => {
    await aws_sqs.sendMessage({
        QueueUrl   : process.env.SQS_APP_DISCORD,
        MessageBody: JSON.stringify(body),
    });

    return {
        statusCode: 202,
        body      : '',
    };
};
