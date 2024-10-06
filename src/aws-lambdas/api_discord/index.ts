import type {APIGatewayProxyEventBase} from 'aws-lambda';
import {badImplementation} from '@hapi/boom';
import {unauthorized} from '@hapi/boom';
import {verifyKey} from 'discord-interactions';
import {respond, tryBody} from '#src/aws-lambdas/api_discord/api-util.ts';
import type {APIInteraction} from '@discordjs/core/http-only';
import {pingPong} from '#src/aws-lambdas/api_discord/handlers/ping-pong.ts';
import {applicationCommand} from '#src/aws-lambdas/api_discord/handlers/application-command.ts';
import {autocomplete} from '#src/aws-lambdas/api_discord/handlers/autocomplete.ts';
import {modalSubmit} from '#src/aws-lambdas/api_discord/handlers/modal-submit.ts';
import {messageComponent} from '#src/aws-lambdas/api_discord/handlers/message-component.ts';
import {discordLogError} from '#src/https/calls/discord-log-error.ts';
import {ITR} from '#src/discord/helpers/re-exports.ts';
import {asBoom} from '#src/utils/as-boom.ts';
import {SECRET} from '#src/internals/secrets.ts';
import {makeLambda} from '@effect-aws/lambda';
import {E, Logger} from '#src/utils/effect.ts';
import {invokeCount, showMetric} from '#src/internals/metrics.ts';

const router = {
    [ITR.Ping]                          : pingPong,
    [ITR.ApplicationCommand]            : applicationCommand,
    [ITR.ApplicationCommandAutocomplete]: autocomplete,
    [ITR.ModalSubmit]                   : modalSubmit,
    [ITR.MessageComponent]              : messageComponent,
} as const;

export const inner = async (req: APIGatewayProxyEventBase<null>) => {
    try {
        const signature = req.headers['x-signature-ed25519']!;
        const timestamp = req.headers['x-signature-timestamp']!;

        const isVerified = await verifyKey(Buffer.from(req.body!), signature, timestamp, SECRET.DISCORD_PUBLIC_KEY);

        if (!isVerified) {
            throw unauthorized('invalid request signature');
        }

        const body = tryBody<APIInteraction>(req.body);

        return await router[body.type](body);
    }
    catch (e) {
        const error = asBoom(e);

        if (error.message !== 'invalid request signature') {
            await discordLogError(error);
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

export const h = (event: APIGatewayProxyEventBase<null>) => E.gen(function * () {
    yield * showMetric(invokeCount);

    return yield * E.promise(async () => await inner(event));
});

export const handler = makeLambda(h, Logger.replace(Logger.defaultLogger, Logger.structuredLogger));
