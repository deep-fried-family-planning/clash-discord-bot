import type {str} from '#src/internal/pure/types-pure.ts';
import {E} from '#src/internal/pure/effect.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {DynamoError} from '#src/internal/errors.ts';
import {decodeDiscordServer} from '#src/dynamo/schema/discord-server.ts';
import {encodeServerId} from '#src/dynamo/schema/common-encoding.ts';


export const serverRead = (server: str) => E.gen(function * () {
    const serverId = yield * encodeServerId(server);

    const item = yield * DynamoDBDocument.get({
        TableName: process.env.DDB_OPERATIONS,
        Key      : {
            pk: serverId,
            sk: 'now',
        },
    });

    if (!item.Item) {
        return yield * new DynamoError({message: '[DiscordServer]: Not found'});
    }

    return yield * decodeDiscordServer(item.Item);
});
