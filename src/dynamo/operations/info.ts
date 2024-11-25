import {E} from '#src/internal/pure/effect.ts';
import type {DRoster, DRosterKey} from '#src/dynamo/schema/discord-roster.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {encodeInfoId, ServerIdEncode} from '#src/dynamo/schema/common.ts';
import {decodeDiscordInfo, type DInfo, type DInfoKey, encodeDiscordInfo} from '#src/dynamo/schema/discord-info.ts';


export const infoCreate = (info: DInfo) => E.gen(function * () {
    const encoded = yield * encodeDiscordInfo(info);

    yield * DynamoDBDocument.put({
        TableName: process.env.DDB_OPERATIONS,
        Item     : encoded,
    });

    return encoded;
});


export const infoRead = (info: DInfoKey) => E.gen(function * () {
    const pk = yield * ServerIdEncode(info.pk);
    const sk = yield * encodeInfoId(info.sk);

    const item = yield * DynamoDBDocument.get({
        TableName: process.env.DDB_OPERATIONS,
        Key      : {pk, sk},
    });

    return yield * decodeDiscordInfo(item.Item);
});


export const infoQueryByServer = (info: Pick<DInfoKey, 'pk'>) => E.gen(function * () {
    const pk = yield * ServerIdEncode(info.pk);

    const items = yield * DynamoDBDocument.query({
        TableName                : process.env.DDB_OPERATIONS,
        KeyConditionExpression   : 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
            ':pk': pk,
            ':sk': 'i-',
        },
    });

    return yield * E.all(items.Items!.map((i) => decodeDiscordInfo(i)));
});


export const infoUpdate = (info: DRoster) => E.gen(function * () {
    const encoded = yield * encodeDiscordInfo(info);

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


export const infoDelete = (info: DRosterKey) => E.gen(function * () {
    const pk = yield * ServerIdEncode(info.pk);
    const sk = yield * encodeInfoId(info.sk);

    yield * DynamoDBDocument.delete({
        TableName: process.env.DDB_OPERATIONS,
        Key      : {pk, sk},
    });
});
