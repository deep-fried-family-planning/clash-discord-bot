import {Document, Id} from '#src/data/arch/index.ts';
import {DataTag} from '#src/data/constants/index.ts';
import {decodeOnly} from '#src/util/util-schema.ts';
import * as DateTime from 'effect/DateTime';
import * as S from 'effect/Schema';
import * as Table from '#src/data/arch/Table.ts';

export const TAG = DataTag.SERVER_CLAN;
export const LATEST = 1;

export const ClanVerification = S.Enums({
  admin    : 0,
  elder    : 1,
  coleader : 2,
  leader   : 3,
  developer: 4,
} as const);

export const Key = Table.Key({
  pk: Id.ServerId,
  sk: Id.ClanTag,
});

export const GsiLinkKey = Table.Key({
  pk2: Id.ClanTag,
  sk2: Id.ServerId,
});

export const Latest = Table.Item(TAG, LATEST, {
  ...Key.fields,
  ...GsiLinkKey.fields,
  alias          : S.optional(S.String),
  name           : S.String,
  description    : S.String,
  thread_prep    : S.optional(Id.ThreadId),
  prep_opponent  : S.optional(Id.ClanTag),
  thread_battle  : S.optional(Id.ThreadId),
  battle_opponent: S.optional(Id.ClanTag),
  countdown      : S.optional(Id.ChannelId),
  verification   : S.optionalWith(ClanVerification, {default: () => 0}),
  select         : S.optional(Table.SelectMenuOption(Id.ClanTag)),
});

const V0 = S.Struct({
  ...Key.fields,
  _tag           : S.tag(DataTag.SERVER_CLAN),
  version        : S.tag(0),
  name           : S.String,
  description    : S.String,
  thread_prep    : S.optional(Id.ThreadId),
  prep_opponent  : S.optional(Id.ClanTag),
  thread_battle  : S.optional(Id.ThreadId),
  battle_opponent: S.optional(Id.ClanTag),
  countdown      : S.optional(Id.ChannelId),
  verification   : S.optionalWith(ClanVerification, {default: () => 0}),
  select         : S.optional(Table.SelectMenuOption(Id.ClanTag)),
  created        : Table.Created,
  updated        : Table.Updated,
  upgraded       : Table.Upgraded,
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
  decodeOnly(V0, S.typeSchema(Latest), (enc) => {
    return {
      ...enc,
      _v      : LATEST,
      _v7     : '',
      upgraded: true,
      pk2     : enc.sk,
      sk2     : enc.pk,
    } as const;
  }),
  decodeOnly(Legacy, S.typeSchema(Latest), (enc) => {
    return {
      _tag           : DataTag.SERVER_CLAN,
      _v             : LATEST,
      _v7            : '',
      upgraded       : true,
      name           : enc.name,
      description    : enc.desc,
      pk             : enc.pk,
      sk             : enc.sk,
      pk2            : enc.sk,
      sk2            : enc.pk,
      thread_prep    : enc.thread_prep,
      prep_opponent  : enc.prep_opponent,
      thread_battle  : enc.thread_battle,
      battle_opponent: enc.battle_opponent,
      countdown      : enc.countdown,
      verification   : enc.verification as any,
      created        : DateTime.unsafeMake(enc.created),
      updated        : DateTime.unsafeMake(enc.updated),
      select         : {
        value: enc.sk,
        label: enc.name,
      },
    } as const;
  }),
);

export const encode = S.encode(Latest);
export const decode = S.decode(Versions);
export const is = S.is(Latest);
export const make = Latest.make;
export const equal = S.equivalence(Latest);
export type Type = typeof Latest.Type;
export type Encoded = typeof Latest.Encoded;
export const put = Document.Put(Latest);
export const get = Document.GetUpgrade(Key, Versions);
export const del = Document.Delete(Key);
