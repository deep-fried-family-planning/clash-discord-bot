import {sColor} from '#src/constants/colors.ts';
import {RK_CLOSE, RK_ENTRY, RK_MODAL_OPEN, RK_MODAL_OPEN_FORWARD} from '#src/constants/route-kind.ts';
import {DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import {logDiscordError} from '#src/discord/layer/log-discord-error.ts';
import {EDIT_DATE_TIME_MODAL_OPEN, EditDateTimeModal, EditEpochT} from '#src/discord/modals/edit-date-time-modal.ts';
import {EDIT_EMBED_MODAL_OPEN, EditEmbedColorT, EditEmbedDescriptionT, EditEmbedModal, EditEmbedTitleT} from '#src/discord/modals/edit-embed-modal.ts';
import {LINK_ACCOUNT_ADMIN_MODAL_OPEN, LinkAccountAdminModal} from '#src/discord/modals/link-account-admin-modal.ts';
import {LINK_ACCOUNT_BULK_MODAL_OPEN, LinkAccountBulkModal} from '#src/discord/modals/link-account-bulk-modal.ts';
import {LINK_ACCOUNT_MODAL_OPEN, LinkAccountModal} from '#src/discord/modals/link-account-modal.ts';
import {LINK_CLAN_MODAL_OPEN, LinkClanModal} from '#src/discord/modals/link-clan-modal.ts';
import {toId} from '#src/discord/store/id-build.ts';
import {fromId} from '#src/discord/store/id-parse.ts';
import {type IxD, IXRT, IXT, MGF} from '#src/internal/discord.ts';
import {DT, E, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {ApiGatewayManagementApi} from '@effect-aws/client-api-gateway-management-api';
import {Lambda} from '@effect-aws/client-lambda';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {makeLambda} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {badImplementation, unauthorized} from '@hapi/boom';
import type {APIGatewayProxyEventBase} from 'aws-lambda';
import {UI} from 'dfx';
import type {MessageComponentDatum, ModalSubmitDatum} from 'dfx/types';
import {verifyKey} from 'discord-interactions';
import {Cause} from 'effect';
import {wsBypass} from '../dev/ws-bypass.ts';



const modals     = {
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
  const id   = fromId(data.custom_id);

  if (id.params.kind === RK_CLOSE) {
    yield * wsBypass(
      'ix_menu_close',
      body,
      Lambda.invoke({
        FunctionName  : process.env.LAMBDA_ARN_DISCORD_MENU_DELETE,
        InvocationType: 'Event',
        Payload       : JSON.stringify(body),
      }),
    );

    return r200({type: IXRT.DEFERRED_UPDATE_MESSAGE});
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

    yield * wsBypass(
      'ix_menu',
      body,
      Lambda.invoke({
        FunctionName  : process.env.LAMBDA_ARN_DISCORD_MENU,
        InvocationType: 'Event',
        Payload       : JSON.stringify(body),
      }),
    );

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

  yield * wsBypass(
    'ix_menu',
    body,
    Lambda.invoke({
      FunctionName  : process.env.LAMBDA_ARN_DISCORD_MENU,
      InvocationType: 'Event',
      Payload       : JSON.stringify(body),
    }),
  );

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
  yield * wsBypass(
    'ix_menu',
    body,
    Lambda.invoke({
      FunctionName  : process.env.LAMBDA_ARN_DISCORD_MENU,
      InvocationType: 'Event',
      Payload       : JSON.stringify(body),
    }),
  );

  return r200({
      type: IXRT.DEFERRED_UPDATE_MESSAGE,
      data: {
        flags: MGF.EPHEMERAL,
      },
    },
  );
});


const respond = ({status, body}: {status: number; body: object | string}) => ({
  statusCode: status,
  body      : JSON.stringify(body),
});
const r200    = (body: object | string) => respond({status: 200, body});
const r202    = (body: object | string) => respond({status: 202, body});


const ping         = (body: IxD) => E.succeed(r200({type: body.type}));
const autocomplete = (body: IxD) => E.succeed(r202({type: body.type}));

const slashCmd = (body: IxD) => E.gen(function * () {
  yield * wsBypass(
    'ix_menu',
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
