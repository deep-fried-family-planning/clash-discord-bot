import {Document, Id} from '#src/data/arch/index.ts';
import * as UserPlayer from '#src/data/user-player.ts';
import * as UserServerLink from '#src/data/user-server-link.ts';
import * as User from '#src/data/user.ts';
import {encodeOnly} from '#src/util/util-schema.ts';
import * as E from 'effect/Effect';
import * as Record from 'effect/Record';
import * as S from 'effect/Schema';

export const Key = Document.Key({
  pk: Id.UserId,
});

export const Items = S.Array(S.Union(
  User.Versions,
  UserPlayer.Versions,
  UserServerLink.Versions,
));

export const get = Document.QueryUpgrade(
  encodeOnly(
    S.Struct({
      KeyConditionExpression: Key,
    }),
    Document.QueryInput,
    (input) => ({
      KeyConditionExpression   : 'pk = :pk',
      ExpressionAttributeValues: Record.mapKeys(input.KeyConditionExpression, (k) => `:${k}`),
    }),
  ),
  Items,
);

export const getAll = (input: Parameters<typeof get>[0]) => E.gen(function* () {
  const first = yield* get(input);
  const items = [...first.Items];
  let last = first.LastEvaluatedKey;

  while (last) {
    const next = yield* get({
      ...input,
      ExclusiveStartKey: last,
    });
    items.push(...next.Items);
    last = next.LastEvaluatedKey;
  }

  return items;
});
