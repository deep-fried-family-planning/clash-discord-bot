import {encodeEmbedId} from '#src/dynamo/schema/common-encoding.ts';
import {decodeDiscordEmbed, type DEmbed, type DEmbedKey, encodeDiscordEmbed} from '#src/dynamo/schema/discord-embed.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import console from 'node:console';

export const discordEmbedCreate = (embed: DEmbed) => E.gen(function* () {
  const encoded = yield* encodeDiscordEmbed(embed);

  yield* DynamoDBDocument.put({
    TableName: process.env.DDB_OPERATIONS,
    Item     : encoded,
  });
});

export const discordEmbedRead = (id: DEmbedKey['pk']) => E.gen(function* () {
  console.log('discordEmbedRead', id);

  const embedId = yield* encodeEmbedId(id);

  const item = yield* DynamoDBDocument.get({
    TableName: process.env.DDB_OPERATIONS,
    Key      : {
      pk: embedId,
      sk: 'now',
    },
  });

  return yield* decodeDiscordEmbed(item.Item);
});

export const discordEmbedDelete = (id: str) => E.gen(function* () {
  const embedId = yield* encodeEmbedId(id);

  yield* DynamoDBDocument.delete({
    TableName: process.env.DDB_OPERATIONS,
    Key      : {
      pk: embedId,
      sk: 'now',
    },
  });
});
