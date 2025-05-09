import {Document, IdSchema} from '#src/data/arch/index.ts';
import {DataTag} from '#src/data/constants/index.ts';
import {decodeOnly} from '#src/util/util-schema.ts';
import * as DateTime from 'effect/DateTime';
import * as S from 'effect/Schema';

export const ClanVerification = S.Enums({
  admin    : 0,
  elder    : 1,
  coleader : 2,
  leader   : 3,
  developer: 4,
} as const);

export const Key = Document.Item({
  pk: IdSchema.ServerId,
  sk: IdSchema.ClanTag,
});

export const Latest = Document.Item({
  ...Key.fields,
  _tag           : S.tag(DataTag.SERVER_CLAN),
  version        : S.tag(0),
  gsi_server_id  : IdSchema.ServerId,
  gsi_clan_tag   : IdSchema.ClanTag,
  name           : S.String,
  description    : S.String,
  thread_prep    : IdSchema.ThreadId,
  prep_opponent  : IdSchema.ClanTag,
  thread_battle  : IdSchema.ThreadId,
  battle_opponent: IdSchema.ClanTag,
  countdown      : IdSchema.ThreadId,
  verification   : S.optionalWith(ClanVerification, {default: () => 0}),
  select         : S.optional(Document.SelectData(IdSchema.ClanTag)),
});

const Legacy = S.Struct({
  type         : S.Literal('DiscordClan'),
  pk           : IdSchema.ServerId,
  sk           : IdSchema.ClanTag,
  gsi_server_id: IdSchema.ServerId,
  gsi_clan_tag : IdSchema.ClanTag,
  version      : S.Literal('1.0.0'),
  created      : S.Date,
  updated      : S.Date,
  embed_id     : S.optional(IdSchema.EmbedId),
  verification : S.Enums({
    admin    : 0,
    elder    : 1,
    coleader : 2,
    leader   : 3,
    developer: 4,
  }).pipe(S.optionalWith({default: () => 0})),
  name           : S.String.pipe(S.optionalWith({default: () => ''})),
  alias          : S.String.pipe(S.optionalWith({default: () => ''})),
  desc           : S.String.pipe(S.optionalWith({default: () => ''})),
  uses           : S.Array(S.String).pipe(S.optionalWith({default: () => [] as string[]})),
  thread_prep    : IdSchema.ThreadId,
  prep_opponent  : IdSchema.ClanTag,
  thread_battle  : IdSchema.ThreadId,
  battle_opponent: IdSchema.ClanTag,
  countdown      : IdSchema.ThreadId,
});

export const Versions = S.Union(
  Latest,
  decodeOnly(Legacy, S.typeSchema(Latest), (enc) => {
    return {
      _tag           : DataTag.SERVER_CLAN,
      version        : 0,
      upgraded       : true,
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
      created        : DateTime.unsafeMake(enc.created),
      updated        : DateTime.unsafeMake(enc.updated),
      select         : {
        value: enc.sk,
        label: enc.name,
      },
    } as const;
  }),
);

export const put = Document.Put(Latest);
export const get = Document.Get(Key, Versions);
export const del = Document.Delete(Key);

export type Type = typeof Latest.Type;
