import * as Document from '#src/data/arch/Document.ts';
import * as Id from '#src/data/arch/Id.ts';
import * as Table from '#src/data/arch/Table.ts';
import * as DataTag from '#src/data/constants/data-tag.ts';
import {decodeOnly} from '#src/util/util-schema.ts';
import * as DateTime from 'effect/DateTime';
import * as S from 'effect/Schema';

export const TAG = DataTag.USER_PLAYER;
export const LATEST = 1;

export const PlayerVerification = S.Enums({
  none     : 0,
  admin    : 1,
  token    : 2,
  developer: 3,
} as const);

export const Key = Table.Key({
  pk: Id.UserId,
  sk: Id.PlayerTag,
});

export const GSI2Key = Table.Key({
  pk2: Id.PlayerTag,
  sk2: Id.UserId,
});

export const Latest = Table.Item(TAG, LATEST, {
  ...Key.fields,
  ...GSI2Key.fields,
  name        : S.String,
  verification: PlayerVerification,
  account_type: S.String,
});

const V0 = S.Struct({
  ...Key.fields,
  _tag        : S.tag(DataTag.USER_PLAYER),
  version     : S.tag(0),
  created     : Table.Created,
  updated     : Table.Updated,
  upgraded    : Table.Upgraded,
  name        : S.String,
  verification: PlayerVerification,
  account_type: S.String,
});

const Legacy = S.Struct({
  pk            : Id.UserId,
  sk            : Id.PlayerTag,
  type          : S.Literal('DiscordPlayer'),
  version       : S.Literal('1.0.0'),
  created       : S.Date,
  updated       : S.Date,
  gsi_user_id   : Id.UserId,
  gsi_player_tag: Id.PlayerTag,
  embed_id      : S.optional(Id.EmbedId),
  alias         : S.optional(S.String),
  verification  : S.Enums({none: 0, admin: 1, token: 2, developer: 3}),
  account_type  : S.String,
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
      ...enc,
      _tag        : DataTag.USER_PLAYER,
      _v          : LATEST,
      _v7         : '',
      upgraded    : true,
      pk          : enc.pk,
      sk          : enc.sk,
      pk2         : enc.sk,
      sk2         : enc.pk,
      name        : '',
      account_type: enc.account_type,
      created     : DateTime.unsafeMake(enc.created),
      updated     : DateTime.unsafeMake(enc.updated),
      verification: enc.verification as any,
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
