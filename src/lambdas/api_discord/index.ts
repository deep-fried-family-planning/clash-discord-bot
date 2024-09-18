import type {APIGatewayProxyEventBase, APIGatewayProxyResult} from 'aws-lambda';
import {badImplementation} from '@hapi/boom';
import type {Boom} from '@hapi/boom';
import {unauthorized} from '@hapi/boom';
import {verifyKey} from 'discord-interactions';
import {getSecret} from '#src/lambdas/client-aws.ts';
import {respond, tryBody} from '#src/lambdas/api_discord/api-util.ts';
import * as console from 'node:console';
import type {APIInteraction} from 'discord-api-types/v10';
import {InteractionType} from 'discord-api-types/v10';
import {pingPong} from '#src/lambdas/api_discord/handlers/ping-pong.ts';
import {applicationCommand} from '#src/lambdas/api_discord/handlers/application-command.ts';
import {autocomplete} from '#src/lambdas/api_discord/handlers/autocomplete.ts';
import {modalSubmit} from '#src/lambdas/api_discord/handlers/modal-submit.ts';
import {messageComponent} from '#src/lambdas/api_discord/handlers/message-component.ts';
import {DISCORD_PUBLIC_KEY} from '#src/constants-secrets.ts';
import {logError} from '#src/api/log-error.ts';

/**
 * @init
 */
const discord_public_key = await getSecret(DISCORD_PUBLIC_KEY);

const router = {
    [InteractionType.Ping]                          : pingPong,
    [InteractionType.ApplicationCommand]            : applicationCommand,
    [InteractionType.ApplicationCommandAutocomplete]: autocomplete,
    [InteractionType.ModalSubmit]                   : modalSubmit,
    [InteractionType.MessageComponent]              : messageComponent,
} as const;

/**
 * @invoke
 */
export const handler = async (req: APIGatewayProxyEventBase<null>): Promise<APIGatewayProxyResult> => {
    try {
        const signature = req.headers['x-signature-ed25519']!;
        const timestamp = req.headers['x-signature-timestamp']!;

        const isVerified = await verifyKey(Buffer.from(req.body!), signature, timestamp, discord_public_key);

        if (!isVerified) {
            throw unauthorized('invalid request signature');
        }

        const body = tryBody<APIInteraction>(req.body);

        return await router[body.type](body as never);
    }
    catch (e) {
        const error = e as Error | Boom;

        if (error.message !== 'invalid request signature') {
            console.error(error, req);
            await logError(error);
        }

        const boom = 'isBoom' in error
            ? error
            : badImplementation();

        return respond({
            status: boom.output.statusCode,
            body  : boom.output.payload,
        });
    }
};
