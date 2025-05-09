import {decodeOnly} from '#src/util/util-schema.ts';
import * as DateTime from 'effect/DateTime';
import * as S from 'effect/Schema';
import {Document, IdSchema} from '../arch';
import {DataTag} from '../constants';

export const Key = Document.Item({
  pk: IdSchema.UserId,
  sk: IdSchema.NowSk,
});

export const Latest = Document.Item({
  ...Key.fields,
  _tag           : S.tag(DataTag.USER),
  version        : S.tag(0),
  created        : Document.Created,
  updated        : Document.Updated,
  upgraded       : Document.Upgraded,
  gsi_all_user_id: IdSchema.UserId,
  timezone       : S.TimeZone,
});

const Legacy = S.Struct({
  pk             : IdSchema.UserId,
  sk             : IdSchema.NowSk,
  type           : S.Literal('DiscordUser'),
  version        : S.Literal('1.0.0'),
  created        : S.Date,
  updated        : S.Date,
  gsi_all_user_id: IdSchema.UserId,
  embed_id       : S.optional(IdSchema.EmbedId),
  timezone       : S.TimeZone,
  quiet          : S.optional(S.String),
});

export const Versions = S.Union(
  Latest,
  decodeOnly(Legacy, S.typeSchema(Latest), (fromA) => {
    return {
      _tag           : DataTag.USER,
      version        : 0,
      upgraded       : true,
      pk             : fromA.pk,
      sk             : fromA.sk,
      gsi_all_user_id: fromA.pk,
      created        : DateTime.unsafeMake(fromA.created),
      updated        : DateTime.unsafeMake(fromA.updated),
      timezone       : fromA.timezone,
    } as const;
  }),
);

export const put = Document.Put(Latest);
export const get = Document.GetUpgrade(Key, Versions);
export const del = Document.Delete(Key);

export type Type = typeof Latest.Type;
