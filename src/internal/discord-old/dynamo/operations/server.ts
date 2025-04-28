import {encodeServerId} from '#src/internal/discord-old/dynamo/schema/common-encoding.ts';
import {decodeDiscordServer} from '#src/internal/discord-old/dynamo/schema/discord-server.ts';
import {DynamoError} from '#src/internal/errors.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';

export const serverRead = (server: str) => E.gen(function* () {
  const serverId = yield* encodeServerId(server);

  const item = yield* DynamoDBDocument.get({
    TableName: process.env.DDB_OPERATIONS,
    Key      : {
      pk: serverId,
      sk: 'now',
    },
  });

  if (!item.Item) {
    return yield* new DynamoError({message: '[DiscordServer]: Not found'});
  }

  return yield* decodeDiscordServer(item.Item);
});
