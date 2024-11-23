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
import {DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import {type IxD, IXRT, MGF} from '#src/discord/util/discord.ts';
import {IXT} from '#src/discord/util/discord.ts';
import {makeLambdaLayer} from '#src/internal/lambda-layer.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {fromId} from '#src/discord/ixc/store/id-parse.ts';
import type {MessageComponentDatum, ModalSubmitDatum} from 'dfx/types';
import {EDIT_EMBED_MODAL_OPEN, EditEmbedColorT, EditEmbedDescriptionT, EditEmbedModal, EditEmbedTitleT} from '#src/discord/ixc/modals/edit-embed-modal.ts';
import {LINK_ACCOUNT_MODAL_OPEN, LinkAccountModal} from '#src/discord/ixc/modals/link-account-modal.ts';
import {UI} from 'dfx';
import {toId} from '#src/discord/ixc/store/id-build.ts';
import {EDIT_DATE_TIME_MODAL_OPEN, EditDateTimeModal} from '#src/discord/ixc/modals/edit-date-time-modal.ts';
import {sColor} from '#src/internal/constants/colors.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {LINK_CLAN_MODAL_OPEN, LinkClanModal} from '#src/discord/ixc/modals/link-clan-modal.ts';


const modals = {
    [LINK_ACCOUNT_MODAL_OPEN.predicate]  : LinkAccountModal,
    [LINK_CLAN_MODAL_OPEN.predicate]     : LinkClanModal,
    [EDIT_EMBED_MODAL_OPEN.predicate]    : EditEmbedModal,
    [EDIT_DATE_TIME_MODAL_OPEN.predicate]: EditDateTimeModal,
};
const modalKinds = [RDXK.MODAL_OPEN, RDXK.MODAL_OPEN_FORWARD];

const component = (body: IxD) => E.gen(function * () {
    const data = body.data! as ModalSubmitDatum | MessageComponentDatum;
    const id = fromId(data.custom_id);

    if (modalKinds.includes(id.params.kind)) {
        const editor = body.message?.embeds.at(-1);

        const curModal
            = id.predicate === EDIT_EMBED_MODAL_OPEN.predicate ? {
                ...EditEmbedModal,
                components: UI.singleColumn([
                    {
                        ...EditEmbedTitleT.component,
                        value: editor!.title!,
                    },
                    {
                        ...EditEmbedColorT.component,
                        value: sColor(editor!.color!),
                    },
                    {
                        ...EditEmbedDescriptionT.component,
                        value: editor!.description!,
                    },
                ]),
            }
            : modals[id.predicate];

        const newId = fromId(curModal.custom_id);

        yield * SQS.sendMessage({
            QueueUrl   : process.env.SQS_URL_DISCORD_MENU,
            MessageBody: JSON.stringify(body),
        });

        yield * DynamoDBDocument.put({
            TableName: process.env.DDB_OPERATIONS,
            Item     : {
                pk   : `t-${body.id}`,
                sk   : `t-${body.id}`,
                token: body.token,
            },
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

    yield * SQS.sendMessage({
        QueueUrl   : process.env.SQS_URL_DISCORD_MENU,
        MessageBody: JSON.stringify(body),
    });

    if (id.params.kind === RDXK.ENTRY) {
        return {statusCode: 202, body: ''};
    }

    return r200({type: IXRT.DEFERRED_UPDATE_MESSAGE});
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
        DynamoDBDocument.defaultLayer,
    ],
}));
