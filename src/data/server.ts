import {Document, Id} from '#src/data/arch/index.ts';
import {DataTag} from '#src/data/constants/index.ts';
import {decodeOnly} from '#src/util/util-schema.ts';
import * as S from 'effect/Schema';

export const Key = Document.Key({
  pk: Id.ServerId,
  sk: Id.NowTag,
});

export const Latest = Document.Version(DataTag.SERVER, 0, Key, {
  forum            : S.optional(Id.ChannelId),
  raids            : S.optional(Id.ThreadId),
  admin            : Id.RoleId,
  gsi_all_server_id: Id.ServerId,
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
  decodeOnly(Legacy, S.typeSchema(Latest), (fromA) => {
    return Document.upgrade({
      _tag             : DataTag.SERVER,
      _ver             : 0,
      pk               : fromA.pk,
      sk               : fromA.sk,
      forum            : fromA.forum,
      raids            : fromA.raids,
      admin            : fromA.admin,
      gsi_all_server_id: fromA.gsi_all_server_id,
    });
  }),
);

export const key = Key.make;
export const is = S.is(Latest);
export const item = Latest.make;
export const equal = S.equivalence(Latest);
export type Type = typeof Latest.Type;
export type Encoded = typeof Latest.Encoded;
export const putItem = Document.Put(Latest);
export const getItem = Document.GetUpgrade(Key, Versions);
export const deleteItem = Document.Delete(Key);
