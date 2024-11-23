import {E} from '#src/internal/pure/effect.ts';
import {decodeDiscordRoster, type DRoster, type DRosterKey, encodeDiscordRoster} from '#src/dynamo/discord-roster.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {encodeRosterId, ServerIdEncode} from '#src/dynamo/common.ts';


export const rosterCreate = (roster: DRoster) => E.gen(function * () {
    const encoded = yield * encodeDiscordRoster(roster);

    yield * DynamoDBDocument.put({
        TableName: process.env.DDB_OPERATIONS,
        Item     : encoded,
    });
});


export const rosterRead = (roster: DRosterKey) => E.gen(function * () {
    const pk = yield * ServerIdEncode(roster.pk);
    const sk = yield * encodeRosterId(roster.sk);

    const item = yield * DynamoDBDocument.get({
        TableName: process.env.DDB_OPERATIONS,
        Key      : {pk, sk},
    });

    return yield * decodeDiscordRoster(item.Item);
});


export const rosterQueryByServer = (roster: Pick<DRosterKey, 'pk'>) => E.gen(function * () {
    const pk = yield * ServerIdEncode(roster.pk);

    const items = yield * DynamoDBDocument.query({
        TableName                : process.env.DDB_OPERATIONS,
        KeyConditionExpression   : 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
            ':pk': pk,
            ':sk': 'r-',
        },
    });

    return yield * E.all(items.Items!.map((i) => decodeDiscordRoster(i)));
});


export const rosterUpdate = (roster: DRoster) => E.gen(function * () {
    const encoded = yield * encodeDiscordRoster(roster);

    const item = yield * DynamoDBDocument.get({
        TableName: process.env.DDB_OPERATIONS,
        Key      : {
            pk: encoded.pk,
            sk: encoded.sk,
        },
    });

    yield * DynamoDBDocument.put({
        TableName: process.env.DDB_OPERATIONS,
        Item     : {
            ...item.Item,
            ...encoded,
        },
    });
});


export const rosterDelete = (roster: DRosterKey) => E.gen(function * () {
    const pk = yield * ServerIdEncode(roster.pk);
    const sk = yield * encodeRosterId(roster.sk);

    yield * DynamoDBDocument.delete({
        TableName: process.env.DDB_OPERATIONS,
        Key      : {pk, sk},
    });
});
