import {Document, Id} from '#src/data/arch/index.ts';
import {DataTag} from '#src/data/constants/index.ts';
import {decodeOnly} from '#src/util/util-schema.ts';
import * as S from 'effect/Schema';

export const ClanVerification = S.Enums({
  admin    : 0,
  elder    : 1,
  coleader : 2,
  leader   : 3,
  developer: 4,
} as const);

export const Key = Document.Key({
  pk: Id.ServerId,
  sk: Id.ClanTag,
});

export const Latest = Document.Item({
  ...Key.fields,
  _tag           : S.tag(DataTag.SERVER_CLAN),
  version        : S.tag(0),
  gsi_server_id  : Id.ServerId,
  gsi_clan_tag   : Id.ClanTag,
  name           : S.String,
  description    : S.String,
  thread_prep    : S.optional(Id.ThreadId),
  prep_opponent  : S.optional(Id.ClanTag),
  thread_battle  : S.optional(Id.ThreadId),
  battle_opponent: S.optional(Id.ClanTag),
  countdown      : S.optional(Id.ChannelId),
  verification   : S.optionalWith(ClanVerification, {default: () => 0}),
  select         : S.optional(Document.SelectData(Id.ClanTag)),
});

const Legacy = S.Struct({
  type           : S.Literal('DiscordClan'),
  pk             : Id.ServerId,
  sk             : Id.ClanTag,
  gsi_server_id  : Id.ServerId,
  gsi_clan_tag   : Id.ClanTag,
  version        : S.Literal('1.0.0'),
  created        : S.Date,
  updated        : S.Date,
  embed_id       : S.optional(Id.EmbedId),
  verification   : S.Enums({admin: 0, elder: 1, coleader: 2, leader: 3, developer: 4}).pipe(S.optionalWith({default: () => 0})),
  name           : S.String.pipe(S.optionalWith({default: () => ''})),
  alias          : S.String.pipe(S.optionalWith({default: () => ''})),
  desc           : S.String.pipe(S.optionalWith({default: () => ''})),
  uses           : S.Array(S.String).pipe(S.optionalWith({default: () => [] as string[]})),
  thread_prep    : Id.ThreadId,
  prep_opponent  : Id.ClanTag,
  thread_battle  : Id.ThreadId,
  battle_opponent: Id.ClanTag,
  countdown      : Id.ThreadId,
});

export const Versions = S.Union(
  Latest,
  decodeOnly(Legacy, S.typeSchema(Latest), (enc) => {
    return Document.upgrade({
      _tag           : DataTag.SERVER_CLAN,
      version        : 0,
      name           : enc.name,
      description    : enc.desc,
      pk             : enc.pk,
      sk             : enc.sk,
      gsi_server_id  : enc.gsi_server_id,
      gsi_clan_tag   : enc.gsi_clan_tag,
      thread_prep    : enc.thread_prep,
      prep_opponent  : enc.prep_opponent,
      thread_battle  : enc.thread_battle,
      battle_opponent: enc.battle_opponent,
      countdown      : enc.countdown,
      verification   : enc.verification as any,
      select         : {value: enc.sk, label: enc.name},
    });
  }),
);

export const makeKey = Key.make;
export const make = Latest.make;
export const is = S.is(Latest);
export const isEqual = S.equivalence(Latest);
export const putItem = Document.Put(Latest);
export const getItem = Document.GetUpgrade(Key, Versions);
export const deleteItem = Document.Delete(Key);
export type Type = typeof Latest.Type;
export type Encoded = typeof Latest.Encoded;
