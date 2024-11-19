import type {APIGatewayProxyEventBase} from 'aws-lambda';
import {badImplementation} from '@hapi/boom';
import {unauthorized} from '@hapi/boom';
import {verifyKey} from 'discord-interactions';
import {makeLambda} from '@effect-aws/lambda';
import {CFG, CSL, E, pipe, RDT} from '#src/internal/pure/effect.ts';
import {invokeCount, showMetric} from '#src/internal/metrics.ts';
import {REDACTED_DISCORD_PUBLIC_KEY} from '#src/internal/constants/secrets.ts';
import {SQS} from '@effect-aws/client-sqs';
import {logDiscordError} from '#src/discord/layer/log-discord-error.ts';
import {IxmLink} from '#src/discord/ixm/ixm-link.ts';
import {DiscordApi, DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import {type IxD, IXRT, MGF} from '#src/discord/util/discord.ts';
import {IXT} from '#src/discord/util/discord.ts';
import {makeLambdaLayer} from '#src/internal/lambda-layer.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {parseCustomId} from '#src/discord/ixc/store/id.ts';


const respond = ({status, body}: {status: number; body: object | string}) => ({
    statusCode: status,
    body      : JSON.stringify(body),
});
const r200 = (body: object | string) => respond({status: 200, body});
const r202 = (body: object | string) => respond({status: 202, body});


const ping = (body: IxD) => E.succeed(r200({type: body.type}));
const autocomplete = (body: IxD) => E.succeed(r202({type: body.type}));

const slashCmd = (body: IxD) => E.gen(function * () {
    yield * SQS.sendMessage({
        QueueUrl   : process.env.SQS_URL_DISCORD_SLASH,
        MessageBody: JSON.stringify(body),
    });

    return r200({type: IXRT.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE});
});

const modal = (body: IxD) => E.gen(function * () {
    yield * SQS.sendMessage({
        QueueUrl   : process.env.SQS_URL_DISCORD_MENU,
        MessageBody: JSON.stringify(body),
    });

    return r200({type: IXRT.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE, data: {
        flags: MGF.EPHEMERAL,
    }});
});


const component = (body: IxD) => E.gen(function * () {
    if ('custom_id' in body.data!) {
        if (body.data.custom_id.startsWith(`/k/${RDXK.MODAL_OPEN}`)) {
            yield * SQS.sendMessage({
                QueueUrl   : process.env.SQS_URL_DISCORD_MENU,
                MessageBody: JSON.stringify(body),
            });

            const id = parseCustomId(body.data.custom_id);

            return r200({
                type: IXRT.MODAL,
                data: {
                    ...IxmLink,
                    custom_id: AXN.NEW_LINK_MODAL_SUBMIT.withForward({
                        nextKind: AXN.NEW_LINK_MODAL_OPEN.params.kind,
                        nextType: AXN.NEW_LINK_MODAL_OPEN.params.type!,
                        forward : id.params.forward!,
                    }).custom_id,
                },
            });
        }
        else if (body.data.custom_id.startsWith(`/k/${RDXK.ENTRY}`)) {
            yield * SQS.sendMessage({
                QueueUrl   : process.env.SQS_URL_DISCORD_MENU,
                MessageBody: JSON.stringify(body),
            });

            return {
                statusCode: 202,
                body      : '',
            };
        }
    }

    yield * SQS.sendMessage({
        QueueUrl   : process.env.SQS_URL_DISCORD_MENU,
        MessageBody: JSON.stringify(body),
    });

    return r200({type: IXRT.DEFERRED_UPDATE_MESSAGE});
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


export const handler = makeLambda(h, makeLambdaLayer({
    apis: [
        DiscordLayerLive,
    ],
    aws: [
        SQS.defaultLayer,
    ],
}));
