import {Document, IdSchema} from '#src/data/arch/index.ts';
import * as UserPlayer from '#src/data/items/user-player.ts';
import * as User from '#src/data/items/user.ts';
import {encodeOnly} from '#src/util/util-schema.ts';
import * as Record from 'effect/Record';
import * as S from 'effect/Schema';

export const Key = Document.Item({
  pk: IdSchema.UserId,
});

export const Items = S.Array(S.Union(
  User.Versions,
  UserPlayer.Versions,
));

export const scan = Document.QueryUpgrade(
  encodeOnly(
    S.Struct({
      KeyConditionExpression: Key,
    }),
    S.Struct({
      KeyConditionExpression   : S.String,
      ExpressionAttributeValues: S.Any,
    }),
    (input) => ({
      KeyConditionExpression   : 'pk = :pk',
      ExpressionAttributeValues: Record.mapKeys(input.KeyConditionExpression, (k) => `:${k}`),
    }),
  ),
  Items,
);
