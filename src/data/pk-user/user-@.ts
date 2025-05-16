import * as Document from '#src/data/arch/Document.ts';
import * as Id from '#src/data/arch/Id.ts';
import * as Table from '#src/data/arch/Table.ts';
import * as DataTag from '#src/data/constants/data-tag.ts';
import {decodeOnly} from '#src/util/util-schema.ts';
import * as DateTime from 'effect/DateTime';
import * as S from 'effect/Schema';

export const TAG = DataTag.USER;
export const LATEST = 1;

export const Key = Table.Key({
  pk: Id.UserId,
  sk: Id.PartitionRoot,
});

export const Latest = Table.Item(TAG, LATEST, {
  pk      : Id.UserId,
  sk      : Id.PartitionRoot,
  pk1     : Id.UserId,
  sk1     : Id.PartitionRoot,
  timezone: S.TimeZone,
  servers : S.Set(Id.ServerId),
});

const V0 = S.Struct({
  ...Key.fields,
  _tag           : S.tag(DataTag.USER),
  version        : S.tag(0),
  created        : Table.Created,
  updated        : Table.Updated,
  upgraded       : Table.Upgraded,
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
  decodeOnly(V0, S.typeSchema(Latest), (fromA) => {
    return {
      ...fromA,
      _v      : LATEST,
      _v7     : '',
      upgraded: true,
      pk1     : fromA.pk,
      sk1     : '@',
      servers : new Set([]),
    } as const;
  }),
  decodeOnly(Legacy, S.typeSchema(Latest), (fromA) => {
    return {
      _tag    : TAG,
      _v      : LATEST,
      _v7     : '',
      upgraded: true,
      pk      : fromA.pk,
      sk      : '@',
      pk1     : fromA.pk,
      sk1     : '@',
      created : DateTime.unsafeMake(fromA.created),
      updated : DateTime.unsafeMake(fromA.updated),
      timezone: fromA.timezone,
      servers : new Set([]),
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
