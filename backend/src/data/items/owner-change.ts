import * as Document from '#src/data/util/DDB.ts';
import * as Id from '#src/data/util/Id.ts';
import * as Table from '#src/data/util/Table.ts';
import * as S from 'effect/Schema';

export const TAG = 'OwnerChange',
             VER = 0;

export const Key = Table.CompKey(Id.ClashTag, Table.Created);

export const Latest = Table.Item(TAG, VER, {
  ...Key.fields,
  current     : S.String,
  previous    : S.optional(S.String),
  verification: S.Int,
});

export const make = Latest.make;
export const create = Document.Put(Latest);
export const scan = Document.QueryV2(
  Id.ClashTag,
  S.Array(Latest),
  (tag) => ({
    KeyConditionExpression   : `pk = :pk`,
    ExpressionAttributeValues: {':pk': tag},
  }),
);
