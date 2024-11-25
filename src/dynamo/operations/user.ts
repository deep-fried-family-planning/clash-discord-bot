import type {str} from '#src/internal/pure/types-pure.ts';
import {E} from '#src/internal/pure/effect.ts';
import {UserIdEncode} from '#src/dynamo/schema/common.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {DynamoError} from '#src/internal/errors.ts';
import {DiscordUserDecode} from '#src/dynamo/schema/discord-user.ts';


export const userRead = (user: str) => E.gen(function * () {
    const userId = yield * UserIdEncode(user);

    const item = yield * DynamoDBDocument.get({
        TableName: process.env.DDB_OPERATIONS,
        Key      : {
            pk: userId,
            sk: 'now',
        },
    });

    if (!item.Item) {
        return yield * new DynamoError({message: '[DiscordUser]: Not found'});
    }

    return yield * DiscordUserDecode(item.Item);
});
