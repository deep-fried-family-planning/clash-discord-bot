import type {APIGatewayProxyEventBase} from 'aws-lambda';
import {badImplementation} from '@hapi/boom';
import {unauthorized} from '@hapi/boom';
import {verifyKey} from 'discord-interactions';
import {makeLambda} from '@effect-aws/lambda';
import {CFG, DT, E, L, Logger, pipe, RDT} from '#src/internal/pure/effect.ts';
import {REDACTED_DISCORD_PUBLIC_KEY} from '#src/constants/secrets.ts';
import {SQS} from '@effect-aws/client-sqs';
import {logDiscordError} from '#src/discord/layer/log-discord-error.ts';
import {DiscordApi, DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import {type IxD, IXRT, MGF} from '#src/internal/discord.ts';
import {IXT} from '#src/internal/discord.ts';
import {fromId} from '#src/discord/store/id-parse.ts';
import type {MessageComponentDatum, ModalSubmitDatum} from 'dfx/types';
import {EDIT_EMBED_MODAL_OPEN, EditEmbedColorT, EditEmbedDescriptionT, EditEmbedModal, EditEmbedTitleT} from '#src/discord/modals/edit-embed-modal.ts';
import {LINK_ACCOUNT_MODAL_OPEN, LinkAccountModal} from '#src/discord/modals/link-account-modal.ts';
import {UI} from 'dfx';
import {toId} from '#src/discord/store/id-build.ts';
import {EDIT_DATE_TIME_MODAL_OPEN, EditDateTimeModal, EditEpochT} from '#src/discord/modals/edit-date-time-modal.ts';
import {sColor} from '#src/constants/colors.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {LINK_CLAN_MODAL_OPEN, LinkClanModal} from '#src/discord/modals/link-clan-modal.ts';
import {LINK_ACCOUNT_ADMIN_MODAL_OPEN, LinkAccountAdminModal} from '#src/discord/modals/link-account-admin-modal.ts';
import {Cause} from 'effect';
import {LINK_ACCOUNT_BULK_MODAL_OPEN, LinkAccountBulkModal} from '#src/discord/modals/link-account-bulk-modal.ts';
import {Lambda} from '@effect-aws/client-lambda';
import {RK_CLOSE, RK_ENTRY, RK_MODAL_OPEN, RK_MODAL_OPEN_FORWARD} from '#src/constants/route-kind.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {fromParameterStore} from '@effect-aws/ssm';


const modals = {
    [LINK_ACCOUNT_MODAL_OPEN.predicate]      : LinkAccountModal,
    [LINK_ACCOUNT_ADMIN_MODAL_OPEN.predicate]: LinkAccountAdminModal,
    [LINK_ACCOUNT_BULK_MODAL_OPEN.predicate] : LinkAccountBulkModal,
    [LINK_CLAN_MODAL_OPEN.predicate]         : LinkClanModal,
    [EDIT_EMBED_MODAL_OPEN.predicate]        : EditEmbedModal,
    [EDIT_DATE_TIME_MODAL_OPEN.predicate]    : EditDateTimeModal,
};
const modalKinds = [RK_MODAL_OPEN, RK_MODAL_OPEN_FORWARD];


const component = (body: IxD) => E.gen(function * () {
    const data = body.data! as ModalSubmitDatum | MessageComponentDatum;
    const id = fromId(data.custom_id);
    if (id.params.kind === RK_CLOSE) {
        yield * Lambda.invoke({
            FunctionName  : process.env.LAMBDA_ARN_DISCORD_MENU_DELETE,
            InvocationType: 'Event',
            Payload       : JSON.stringify(body),
        });
        return r200({type: IXRT.DEFERRED_UPDATE_MESSAGE}); ;
    }


    if (modalKinds.includes(id.params.kind)) {
        const editor = body.message?.embeds.at(-1);

        const curModal
            = id.predicate === EDIT_EMBED_MODAL_OPEN.predicate ? {
                ...EditEmbedModal,
                components: UI.singleColumn([{
                    ...EditEmbedTitleT.component,
                    value: editor!.title!,
                }, {
                    ...EditEmbedColorT.component,
                    value: sColor(editor!.color!),
                }, {
                    ...EditEmbedDescriptionT.component,
                    value: editor!.description!,
                }]),
            }
            : id.predicate === EDIT_DATE_TIME_MODAL_OPEN.predicate ? {
                ...EditDateTimeModal,
                components: UI.singleColumn([{
                    ...EditEpochT.component,
                    value: editor?.timestamp ? `${new Date(editor.timestamp).getTime()}` : `${Date.now()}`,
                }]),
            }
            : modals[id.predicate];

        const newId = fromId(curModal.custom_id);

        yield * DynamoDBDocument.put({
            TableName: process.env.DDB_OPERATIONS,
            Item     : {
                pk      : `t-${body.id}`,
                sk      : `t-${body.id}`,
                token   : body.token,
                bodyJSON: JSON.stringify(body),
            },
        });

        yield * Lambda.invoke({
            FunctionName  : process.env.LAMBDA_ARN_DISCORD_MENU,
            InvocationType: 'Event',
            Payload       : JSON.stringify(body),
        });

        return r200({
            type: IXRT.MODAL,
            data: {
                ...curModal,
                custom_id: toId({
                    kind    : newId.params.kind,
                    type    : newId.params.type,
                    nextKind: id.params.nextKind,
                    nextType: id.params.nextType,
                    forward : body.id,
                }).custom_id,
            },
        });
    }

    yield * Lambda.invoke({
        FunctionName  : process.env.LAMBDA_ARN_DISCORD_MENU,
        InvocationType: 'Event',
        Payload       : JSON.stringify(body),
    });

    if (id.params.kind === RK_ENTRY) {
        return r200({
            type: IXRT.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                flags: MGF.EPHEMERAL,
            },
        });
    }

    return r200({type: IXRT.DEFERRED_UPDATE_MESSAGE});
});


const modal = (body: IxD) => E.gen(function * () {
    yield * Lambda.invoke({
        FunctionName  : process.env.LAMBDA_ARN_DISCORD_MENU,
        InvocationType: 'Event',
        Payload       : JSON.stringify(body),
    });

    return r200({
        type: IXRT.DEFERRED_UPDATE_MESSAGE,
        data: {
            flags: MGF.EPHEMERAL,
        }},
    );
});


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
    L.provideMerge(L.mergeAll(
        Scheduler.defaultLayer,
        Lambda.defaultLayer,
        SQS.defaultLayer,
        DynamoDBDocument.defaultLayer,
    )),
    L.provideMerge(L.setConfigProvider(fromParameterStore())),
    L.provideMerge(L.setTracerTiming(true)),
    L.provideMerge(L.setTracerEnabled(true)),
    L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
    L.provideMerge(DT.layerCurrentZoneLocal),
);

export const handler = makeLambda(h, live);
