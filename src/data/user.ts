import {decodeOnly} from '#src/util/util-schema.ts';
import * as S from 'effect/Schema';
import {Document, Id} from 'src/data/arch/index.ts';
import {DataTag} from 'src/data/constants/index.ts';

export const Key = Document.Key({
  pk: Id.UserId,
  sk: Id.NowTag,
});

export const Latest = Document.Item({
  ...Key.fields,
  _tag           : S.tag(DataTag.USER),
  _ver           : S.tag(0),
  gsi_all_user_id: Id.UserId,
  timezone       : S.TimeZone,
});

const Legacy = S.Struct({
  pk             : Id.UserId,
  sk             : Id.NowSk,
  type           : S.Literal('DiscordUser'),
  version        : S.Literal('1.0.0'),
  created        : S.Date,
  updated        : S.Date,
  gsi_all_user_id: Id.UserId,
  embed_id       : S.optional(Id.EmbedId),
  timezone       : S.TimeZone,
  quiet          : S.optional(S.String),
});

export const Versions = S.Union(
  Latest,
  decodeOnly(Legacy, S.typeSchema(Latest), (fromA) => {
    return Document.upgrade({
      _tag           : DataTag.USER,
      _ver           : 0,
      pk             : fromA.pk,
      sk             : fromA.sk,
      gsi_all_user_id: fromA.pk,
      timezone       : fromA.timezone,
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
