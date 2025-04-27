import type {CompKey} from '#src/dynamo/dynamo.ts';
import {encodeServerId} from '#src/dynamo/schema/common-encoding.ts';
import {ChannelId, EmbedId, MessageId, NowId, RoleId, ServerId, ThreadId} from '#src/dynamo/schema/common.ts';
import {DynamoError} from '#src/internal/errors.ts';
import {E, pipe, S} from '#src/internal/pure/effect.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Console} from 'effect';

export const DiscordServer = S.Struct({
  type: S.Literal('DiscordServer'),

  pk: ServerId,
  sk: NowId,

  version: S.Literal('1.0.0'),
  created: S.Date,
  updated: S.Date,

  gsi_all_server_id: ServerId,

  embed_id: S.optional(EmbedId),

  omni_channel_id: S.optional(ChannelId),
  omni_message_id: S.optional(MessageId),

  name : S.String.pipe(S.optionalWith({default: () => ''})),
  alias: S.String.pipe(S.optionalWith({default: () => ''})),
  desc : S.String.pipe(S.optionalWith({default: () => ''})),

  polling : S.Boolean,
  timezone: S.optional(S.TimeZone),

  announcements: S.optional(ChannelId),
  info         : S.optional(ChannelId),
  general      : S.optional(ChannelId),
  slash        : S.optional(ChannelId),
  staff        : S.optional(ChannelId),
  forum        : S.optional(ChannelId),
  errors       : S.optional(ChannelId),

  raids: S.optional(ThreadId),

  admin : RoleId,
  member: S.optional(RoleId),
  guest : S.optional(RoleId),
});
export type DServer = S.Schema.Type<typeof DiscordServer>;

export const encodeDiscordServer = S.encodeUnknown(DiscordServer);
export const decodeDiscordServer = S.decodeUnknown(DiscordServer);

export const putDiscordServer = (record: DServer) => pipe(
  encodeDiscordServer(record),
  E.flatMap((encoded) => pipe(
    DynamoDBDocument.put({
      TableName: process.env.DDB_OPERATIONS,
      Item     : encoded,
    }),
    E.tap(Console.log('[PUT DDB]: server encoded', encoded)),
  )),
);

export const getDiscordServer = (key: CompKey<DServer>) => pipe(
  encodeServerId(key.pk),
  E.flatMap((pk) => DynamoDBDocument.get({
    TableName: process.env.DDB_OPERATIONS,
    Key      : {
      pk: pk,
      sk: key.sk,
    },
    ConsistentRead: true,
  })),
  E.flatMap(({Item}) => pipe(
    E.if(Boolean(Item), {
      onTrue : () => decodeDiscordServer(Item),
      onFalse: () => new DynamoError({message: 'NotFound: DiscordServer'}),
    }),
    E.flatMap((decoded) => pipe(
      E.succeed(decoded),
      E.tap(Console.log('[GET DDB]: server decoded', decoded)),
    )),
  )),
);

export const scanDiscordServers = () => pipe(
  DynamoDBDocument.scan({
    TableName: process.env.DDB_OPERATIONS,
    IndexName: 'GSI_ALL_SERVERS',
  }),
  E.flatMap(({Items}) => pipe(
    E.if(Boolean(Items), {
      onTrue : () => E.all(pipe(Items!, mapL((Item) => decodeDiscordServer(Item)))),
      onFalse: () => E.succeed([]),
    }),
    E.flatMap((decoded) => pipe(
      E.succeed(decoded),
      E.tap(Console.log('[SCAN DDB]: servers decoded', decoded)),
    )),
  )),
);
