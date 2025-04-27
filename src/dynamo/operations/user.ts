import {encodeUserId} from '#src/dynamo/schema/common-encoding.ts';
import {decodeDiscordUser, type DUser, encodeDiscordUser} from '#src/dynamo/schema/discord-user.ts';
import {DynamoError} from '#src/internal/errors.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';

export const userRead = (user: str) => E.gen(function* () {
  const userId = yield* encodeUserId(user);

  const item = yield* DynamoDBDocument.get({
    TableName: process.env.DDB_OPERATIONS,
    Key      : {
      pk: userId,
      sk: 'now',
    },
  });

  if (!item.Item) {
    return yield* new DynamoError({message: '[DiscordUser]: Not found'});
  }

  return yield* decodeDiscordUser(item.Item);
});

export const userCreate = (user: DUser) => E.gen(function* () {
  const encoded = yield* encodeDiscordUser(user);

  yield* DynamoDBDocument.put({
    TableName: process.env.DDB_OPERATIONS,
    Item     : encoded,
  });
});

export const userDelete = (user: str) => E.gen(function* () {
  const userId = yield* encodeUserId(user);

  yield* DynamoDBDocument.delete({
    TableName: process.env.DDB_OPERATIONS,
    Key      : {
      pk: userId,
      sk: 'now',
    },
  });
});
