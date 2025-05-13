import {Document, Id} from '#src/data/arch/index.ts';
import {DataTag} from '#src/data/constants/index.ts';
import {decodeOnly} from '#src/util/util-schema.ts';
import * as DateTime from 'effect/DateTime';
import * as S from 'effect/Schema';
import {Struct} from '#src/data/arch/Table.ts';
import * as Table from '#src/data/arch/Table.ts';

export const TAG = DataTag.SERVER;
export const LATEST = 1;

export const Key = Table.Key({
  pk: Id.ServerId,
  sk: Id.NowSk,
});

export const GsiPollKey = Table.Key({
  pkp: Id.ServerId,
  skp: Id.PartitionRoot,
});

export const Latest = Table.Item(TAG, LATEST, {
  ...Key.fields,
  ...GsiPollKey.fields,
  forum: S.optional(Id.ChannelId),
  raids: S.optional(Id.ThreadId),
  admin: Id.RoleId,
});

const V0 = Table.Struct({
  ...Key.fields,
  ...GsiPollKey.fields,
  _tag    : S.tag(DataTag.SERVER),
  version : S.tag(0),
  forum   : S.optional(Id.ChannelId),
  raids   : S.optional(Id.ThreadId),
  admin   : Id.RoleId,
  created : Table.Created,
  updated : Table.Updated,
  upgraded: Table.Upgraded,
});

const Legacy = S.Struct({
  type             : S.Literal('DiscordServer'),
  pk               : Id.ServerId,
  sk               : Id.NowSk,
  version          : S.Literal('1.0.0'),
  created          : S.Date,
  updated          : S.Date,
  gsi_all_server_id: Id.ServerId,
  embed_id         : S.optional(Id.EmbedId),
  omni_channel_id  : S.optional(Id.ChannelId),
  omni_message_id  : S.optional(Id.MessageId),
  name             : S.String.pipe(S.optionalWith({default: () => ''})),
  alias            : S.String.pipe(S.optionalWith({default: () => ''})),
  desc             : S.String.pipe(S.optionalWith({default: () => ''})),
  polling          : S.Boolean,
  timezone         : S.optional(S.TimeZone),
  announcements    : S.optional(Id.ChannelId),
  info             : S.optional(Id.ChannelId),
  general          : S.optional(Id.ChannelId),
  slash            : S.optional(Id.ChannelId),
  staff            : S.optional(Id.ChannelId),
  forum            : S.optional(Id.ChannelId),
  errors           : S.optional(Id.ChannelId),
  raids            : S.optional(Id.ThreadId),
  admin            : Id.RoleId,
  member           : S.optional(Id.RoleId),
  guest            : S.optional(Id.RoleId),
});

export const Versions = S.Union(
  Latest,
  decodeOnly(V0, S.typeSchema(Latest), (fromA) => {
    return {
      ...fromA,
      _v      : LATEST,
      _v7     : '',
      upgraded: true,
      pkp     : fromA.pk,
      skp     : '.',
    } as const;
  }),
  decodeOnly(Legacy, S.typeSchema(Latest), (fromA) => {
    return {
      _tag    : TAG,
      _v      : LATEST,
      _v7     : '',
      upgraded: true,
      pk      : fromA.pk,
      sk      : fromA.sk,
      pkp     : fromA.pk,
      skp     : '.',
      created : DateTime.unsafeMake(fromA.created),
      updated : DateTime.unsafeMake(fromA.updated),
      forum   : fromA.forum,
      raids   : fromA.raids,
      admin   : fromA.admin,
    } as const;
  }),
);

export type Type = typeof Latest.Type;
export type Encoded = typeof Latest.Encoded;
export const is = S.is(Latest);
export const make = Latest.make;
export const equal = S.equivalence(Latest);
export const put = Document.Put(Latest);
export const get = Document.GetUpgrade(Key, Versions);
export const del = Document.Delete(Key);
