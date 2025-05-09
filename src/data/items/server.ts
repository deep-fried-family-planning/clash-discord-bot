import {Document, IdSchema} from '#src/data/arch/index.ts';
import {DataTag} from '#src/data/constants/index.ts';
import {decodeOnly} from '#src/util/util-schema.ts';
import * as DateTime from 'effect/DateTime';
import * as S from 'effect/Schema';

export const Key = Document.Item({
  pk: IdSchema.ServerId,
  sk: IdSchema.NowSk,
});

export const Latest = Document.Item({
  ...Key.fields,
  _tag             : S.tag(DataTag.SERVER),
  version          : S.tag(0),
  gsi_all_server_id: IdSchema.ServerId,
  forum            : S.optional(IdSchema.ChannelId),
  raids            : S.optional(IdSchema.ThreadId),
  admin            : IdSchema.RoleId,
  created          : Document.Created,
  updated          : Document.Updated,
  upgraded         : Document.Upgraded,
});

const Legacy = S.Struct({
  type             : S.Literal('DiscordServer'),
  pk               : IdSchema.ServerId,
  sk               : IdSchema.NowSk,
  version          : S.Literal('1.0.0'),
  created          : S.Date,
  updated          : S.Date,
  gsi_all_server_id: IdSchema.ServerId,
  embed_id         : S.optional(IdSchema.EmbedId),
  omni_channel_id  : S.optional(IdSchema.ChannelId),
  omni_message_id  : S.optional(IdSchema.MessageId),
  name             : S.String.pipe(S.optionalWith({default: () => ''})),
  alias            : S.String.pipe(S.optionalWith({default: () => ''})),
  desc             : S.String.pipe(S.optionalWith({default: () => ''})),
  polling          : S.Boolean,
  timezone         : S.optional(S.TimeZone),
  announcements    : S.optional(IdSchema.ChannelId),
  info             : S.optional(IdSchema.ChannelId),
  general          : S.optional(IdSchema.ChannelId),
  slash            : S.optional(IdSchema.ChannelId),
  staff            : S.optional(IdSchema.ChannelId),
  forum            : S.optional(IdSchema.ChannelId),
  errors           : S.optional(IdSchema.ChannelId),
  raids            : S.optional(IdSchema.ThreadId),
  admin            : IdSchema.RoleId,
  member           : S.optional(IdSchema.RoleId),
  guest            : S.optional(IdSchema.RoleId),
});

export const Versions = S.Union(
  Latest,
  decodeOnly(Legacy, S.typeSchema(Latest), (fromA) => {
    return {
      _tag             : DataTag.SERVER,
      version          : 0,
      upgraded         : true,
      pk               : fromA.pk,
      sk               : fromA.sk,
      gsi_all_server_id: fromA.pk,
      created          : DateTime.unsafeMake(fromA.created),
      updated          : DateTime.unsafeMake(fromA.updated),
      forum            : fromA.forum,
      raids            : fromA.raids,
      admin            : fromA.admin,
    } as const;
  }),
);

export const put = Document.Put(Latest);
export const get = Document.Get(Key, Versions);
export const del = Document.Delete(Key);

export type Type = typeof Latest.Type;
