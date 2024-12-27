import {DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import {logDiscordError} from '#src/discord/layer/log-discord-error.ts';
import {type IxD, IXRT, IXT} from '#src/internal/discord.ts';
import {DT, E, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {ApiGatewayManagementApi} from '@effect-aws/client-api-gateway-management-api';
import {Lambda} from '@effect-aws/client-lambda';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {makeLambda} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {badImplementation, unauthorized} from '@hapi/boom';
import type {APIGatewayProxyEventBase} from 'aws-lambda';
import {verifyKey} from 'discord-interactions';
import {Cause} from 'effect';
import {wsBypass} from '../dev/ws-bypass.ts';


/**
 * @desc https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback
 */
const deferLater = () => r202('');


const component = (body: IxD) => E.gen(function * () {
    yield * wsBypass('ix_menu', body, Lambda.invoke({
        FunctionName  : process.env.LAMBDA_ARN_DISCORD_MENU,
        InvocationType: 'Event',
        Payload       : JSON.stringify(body),
    }));

    return deferLater();
});


const modal = (body: IxD) => E.gen(function * () {
    yield * wsBypass('ix_menu', body, Lambda.invoke({
        FunctionName  : process.env.LAMBDA_ARN_DISCORD_MENU,
        InvocationType: 'Event',
        Payload       : JSON.stringify(body),
    }));

    return deferLater();
});


const respond = ({status, body}: {status: number; body: object | string}) => ({
    statusCode: status,
    body      : JSON.stringify(body),
});

const r200 = (body: object | string) => respond({status: 200, body});
const r202 = (body: object | string) => respond({status: 202, body});

const ping         = (body: IxD) => E.succeed(r200({type: body.type}));
const autocomplete = (body: IxD) => E.succeed(r202({type: body.type}));

const slashCmd = (body: IxD) => E.gen(function * () {
    yield * wsBypass(
        'ix_slash',
        body,
        Lambda.invoke({
            FunctionName  : process.env.LAMBDA_ARN_IX_SLASH,
            InvocationType: 'Event',
            Payload       : JSON.stringify(body),
        }),
    );

    return r200({type: IXRT.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE});
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
        const signature = req.headers['x-signature-ed25519']!;
        const timestamp = req.headers['x-signature-timestamp']!;

        const isVerified = yield * E.tryPromise(() => verifyKey(
            Buffer.from(req.body!),
            signature,
            timestamp,
            process.env.DFFP_DISCORD_PUBLIC_KEY,
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
    E.catchAllCause((error) => E.gen(function * () {
        const e = Cause.prettyErrors(error);

        yield * logDiscordError(e);

        const boom = badImplementation();

        return respond({
            status: boom.output.statusCode,
            body  : boom.output.payload,
        });
    })),
    E.catchAllDefect((defect) => E.gen(function * () {
        yield * logDiscordError([defect]).pipe(E.ignoreLogged);

        const boom = badImplementation();

        return respond({
            status: boom.output.statusCode,
            body  : boom.output.payload,
        });
    })),
);


const live = pipe(
    DiscordLayerLive,
    L.provideMerge(Scheduler.defaultLayer),
    L.provideMerge(SQS.defaultLayer),
    L.provideMerge(DynamoDBDocument.defaultLayer),
    L.provideMerge(Lambda.defaultLayer),
    L.provideMerge(ApiGatewayManagementApi.layer({
        endpoint: process.env.APIGW_DEV_WS,
    })),
    L.provideMerge(L.setTracerTiming(true)),
    L.provideMerge(L.setTracerEnabled(true)),
    L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
    L.provideMerge(DT.layerCurrentZoneLocal),
);

export const handler = makeLambda(h, live);
