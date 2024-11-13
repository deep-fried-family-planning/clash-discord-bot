import type {APIGatewayProxyEventBase} from 'aws-lambda';
import {badImplementation} from '@hapi/boom';
import {unauthorized} from '@hapi/boom';
import {InteractionResponseType, verifyKey} from 'discord-interactions';
import {respond} from '#src/aws-lambdas/api_discord/api-util.ts';
import type {APIInteraction} from '@discordjs/core/http-only';
import {ITR} from '#src/aws-lambdas/discord_menu/old/re-exports.ts';
import {makeLambda} from '@effect-aws/lambda';
import {Cfg, CFG, CSL, E, L, Logger, pipe, RDT} from '#src/internals/re-exports/effect.ts';
import {invokeCount, showMetric} from '#src/internals/metrics.ts';
import {REDACTED_DISCORD_BOT_TOKEN, REDACTED_DISCORD_PUBLIC_KEY} from '#src/internals/constants/secrets.ts';
import {SQSService} from '@effect-aws/client-sqs';
import {logDiscordError} from '#src/internals/errors/log-discord-error.ts';
import {DiscordConfig, DiscordRESTMemoryLive, UI} from 'dfx';
import {NodeHttpClient} from '@effect/platform-node';
import {fromParameterStore} from '@effect-aws/ssm';
import {TXTS} from '#src/internals/re-exports/discordjs.ts';

type DIngress = APIInteraction;

const ping = (body: DIngress) => E.succeed(respond({
    status: 200,
    body  : {
        type: body.type,
    },
}));

const slashCmd = (body: DIngress) => E.gen(function * () {
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

const autocomplete = (body: DIngress) => E.succeed(respond({
    status: 200,
    body  : {
        type: body.type,
    },
}));

const modal = (body: DIngress) => E.gen(function * () {
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

const component = (body: DIngress) => E.gen(function * () {
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
                    data: {
                        title     : 'Link Account',
                        custom_id : `modal-link-account`,
                        components: UI.singleColumn([
                            UI.textInput({
                                style      : TXTS.Short,
                                custom_id  : 'modal-link-account-player-tag',
                                label      : 'Player Tag',
                                placeholder: 'check in-game profile',
                            }),
                            UI.textInput({
                                style      : TXTS.Short,
                                custom_id  : 'modal-link-account-api-token',
                                label      : 'API Token',
                                placeholder: 'check in-game settings',
                            }),
                            UI.textInput({
                                style      : TXTS.Paragraph,
                                custom_id  : 'modal-link-account-about',
                                label      : 'Tell Us About Yourself',
                                placeholder: 'fun facts',
                            }),
                        ]),
                    },
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
    [ITR.Ping]                          : ping,
    [ITR.ApplicationCommand]            : slashCmd,
    [ITR.ApplicationCommandAutocomplete]: autocomplete,
    [ITR.ModalSubmit]                   : modal,
    [ITR.MessageComponent]              : component,
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

        const body = JSON.parse(req.body!) as DIngress;

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
    DiscordRESTMemoryLive,
    L.provideMerge(SQSService.defaultLayer),
    L.provide(DiscordConfig.layerConfig({token: Cfg.redacted(REDACTED_DISCORD_BOT_TOKEN)})),
    L.provide(NodeHttpClient.layer),
    L.provide(L.setConfigProvider(fromParameterStore())),
    L.provide(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);

export const handler = makeLambda(h, LambdaLive);
