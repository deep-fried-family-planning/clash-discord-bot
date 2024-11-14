import type {APIGatewayProxyEventBase} from 'aws-lambda';
import {badImplementation} from '@hapi/boom';
import {unauthorized} from '@hapi/boom';
import {InteractionResponseType, verifyKey} from 'discord-interactions';
import {makeLambda} from '@effect-aws/lambda';
import {CFG, CSL, E, L, Logger, pipe, RDT} from '#src/internal/pure/effect.ts';
import {invokeCount, showMetric} from '#src/internal/metrics.ts';
import {REDACTED_DISCORD_BOT_TOKEN, REDACTED_DISCORD_PUBLIC_KEY} from '#src/internal/constants/secrets.ts';
import {SQSService} from '@effect-aws/client-sqs';
import {logDiscordError} from '#src/discord/layer/log-discord-error.ts';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import {NodeHttpClient} from '@effect/platform-node';
import {fromParameterStore} from '@effect-aws/ssm';
import {IxmLink} from '#src/discord/ixm/ixm-link.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import type {IxD} from '#src/discord/util/discord.ts';
import {IXT} from '#src/discord/util/discord.ts';


const respond = ({status, body}: {status: number; body: object | string}) => ({
    statusCode: status,
    body      : JSON.stringify(body),
});


const ping = (body: IxD) => E.succeed(respond({
    status: 200,
    body  : {
        type: body.type,
    },
}));


const slashCmd = (body: IxD) => E.gen(function * () {
    yield * SQSService.sendMessage({
        QueueUrl   : process.env.SQS_URL_DISCORD_SLASH,
        MessageBody: JSON.stringify(body),
    });

    return respond({
        status: 200,
        body  : {
            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        },
    });
});


const autocomplete = (body: IxD) => E.succeed(respond({
    status: 200,
    body  : {
        type: body.type,
    },
}));


const modal = (body: IxD) => E.gen(function * () {
    yield * SQSService.sendMessage({
        QueueUrl   : process.env.SQS_URL_DISCORD_MENU,
        MessageBody: JSON.stringify(body),
    });

    return respond({
        status: 200,
        body  : {
            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        },
    });
});


const component = (body: IxD) => E.gen(function * () {
    yield * SQSService.sendMessage({
        QueueUrl   : process.env.SQS_URL_DISCORD_MENU,
        MessageBody: JSON.stringify(body),
    });

    if ('custom_id' in body.data!) {
        if (body.data.custom_id.startsWith('Modal')) {
            return respond({
                status: 200,
                body  : {
                    type: InteractionResponseType.MODAL,
                    data: IxmLink,
                },
            });
        }
        else if (body.data.custom_id.startsWith('Entry')) {
            return {
                statusCode: 202,
                body      : '',
            };
        }
    }

    return respond({
        status: 200,
        body  : {
            type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
        },
    });
});


const router = {
    [IXT.PING]                            : ping,
    [IXT.APPLICATION_COMMAND]             : slashCmd,
    [IXT.APPLICATION_COMMAND_AUTOCOMPLETE]: autocomplete,
    [IXT.MODAL_SUBMIT]                    : modal,
    [IXT.MESSAGE_COMPONENT]               : component,
} as const;


const h = (req: APIGatewayProxyEventBase<null>) => pipe(
    E.gen(function * () {
        yield * showMetric(invokeCount);
        yield * CSL.debug('DiscordIngress', req);

        const signature = req.headers['x-signature-ed25519']!;
        const timestamp = req.headers['x-signature-timestamp']!;

        const publicKey = RDT.value(yield * CFG.redacted(REDACTED_DISCORD_PUBLIC_KEY));

        const isVerified = yield * E.tryPromise(() => verifyKey(
            Buffer.from(req.body!),
            signature,
            timestamp,
            publicKey,
        ));

        if (!isVerified) {
            const boom = unauthorized('invalid request signature');

            return respond({
                status: boom.output.statusCode,
                body  : boom.output.payload,
            });
        }

        const body = JSON.parse(req.body!) as IxD;

        return yield * router[body.type](body);
    }),
    E.catchAllDefect((defect) => E.gen(function * () {
        yield * logDiscordError([defect]).pipe(E.ignoreLogged);

        const boom = badImplementation();

        return respond({
            status: boom.output.statusCode,
            body  : boom.output.payload,
        });
    })),
);


const LambdaLive = pipe(
    DiscordApi.Live,
    L.provideMerge(SQSService.defaultLayer),
    L.provideMerge(DiscordRESTMemoryLive),
    L.provide(DiscordConfig.layerConfig({token: CFG.redacted(REDACTED_DISCORD_BOT_TOKEN)})),
    L.provide(NodeHttpClient.layer),
    L.provide(L.setConfigProvider(fromParameterStore())),
    L.provide(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);


export const handler = makeLambda(h, LambdaLive);
