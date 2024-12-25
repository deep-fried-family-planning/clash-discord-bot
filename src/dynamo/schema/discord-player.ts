import type {CompKey} from '#src/dynamo/dynamo.ts';
import {encodePlayerTag, encodeUserId} from '#src/dynamo/schema/common-encoding.ts';
import {EmbedId, PlayerTag, UserId} from '#src/dynamo/schema/common.ts';
import {DynamoError} from '#src/internal/errors.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Console, Schema as S} from 'effect';


export const DiscordPlayer = S.Struct({
    pk: UserId,
    sk: PlayerTag,

    type   : S.Literal('DiscordPlayer'),
    version: S.Literal('1.0.0'),

    created: S.Date,
    updated: S.Date,

    gsi_user_id   : UserId,
    gsi_player_tag: PlayerTag,

    embed_id: S.optional(EmbedId),

    alias: S.optional(S.String),

    verification: S.Enums({
        none     : 0,
        admin    : 1,
        token    : 2,
        developer: 3,
    }),

    account_type: S.String,
});
export type DPlayer = S.Schema.Type<typeof DiscordPlayer>;


export const decodeDiscordPlayer = S.decodeUnknown(DiscordPlayer);
export const encodeDiscordPlayer = S.encodeUnknown(DiscordPlayer);


export const putDiscordPlayer = (record: DPlayer) => pipe(
    encodeDiscordPlayer(record),
    E.flatMap((encoded) => pipe(
        DynamoDBDocument.put({
            TableName: process.env.DDB_OPERATIONS,
            Item     : encoded,
        }),
        E.tap(Console.log('[PUT DDB]: player encoded', encoded)),
    )),
);


export const getDiscordPlayer = (key: CompKey<DPlayer>) => pipe(
    [encodeUserId(key.pk), encodePlayerTag(key.sk)],
    E.all,
    E.flatMap(([pk, sk]) => DynamoDBDocument.get({
        TableName: process.env.DDB_OPERATIONS,
        Key      : {
            pk,
            sk,
        },
        ConsistentRead: true,
    })),
    E.flatMap(({Item}) => pipe(
        E.if(Boolean(Item), {
            onTrue : () => decodeDiscordPlayer(Item),
            onFalse: () => new DynamoError({message: 'NotFound: DiscordPlayer'}),
        }),
        E.flatMap((decoded) => pipe(
            E.succeed(decoded),
            E.tap(Console.log('[GET DDB]: player decoded', decoded)),
        )),
    )),
);


export const queryPlayersForUser = (key: Pick<CompKey<DPlayer>, 'pk'>) => pipe(
    encodeUserId(key.pk),
    E.flatMap((pk) => DynamoDBDocument.query({
        TableName                : process.env.DDB_OPERATIONS,
        KeyConditionExpression   : 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
            ':pk': pk,
            ':sk': 'p-',
        },
    })),
    E.flatMap(({Items}) => pipe(
        E.if(Boolean(Items), {
            onTrue : () => E.all(pipe(Items!, mapL((Item) => decodeDiscordPlayer(Item)))),
            onFalse: () => E.succeed([] as DPlayer[]),
        }),
        E.flatMap((decoded) => pipe(
            E.succeed(decoded),
            E.tap(Console.log('[QUERY DDB]: player decoded', decoded)),
        )),
    )),
);


export const queryDiscordPlayer = (key: Pick<CompKey<DPlayer>, 'sk'>) => pipe(
    encodePlayerTag(key.sk),
    E.flatMap((sk) => DynamoDBDocument.query({
        TableName                : process.env.DDB_OPERATIONS,
        IndexName                : 'GSI_ALL_PLAYERS',
        KeyConditionExpression   : 'gsi_player_tag = :gsi_player_tag',
        ExpressionAttributeValues: {
            ':gsi_player_tag': sk,
        },
    })),
    E.flatMap(({Items}) => pipe(
        E.if(Boolean(Items), {
            onTrue : () => E.all(pipe(Items!, mapL((Item) => decodeDiscordPlayer(Item)))),
            onFalse: () => E.succeed([undefined] as const),
        }),
        E.flatMap((decoded) => pipe(
            E.succeed(decoded),
            E.tap(Console.log('[QUERY DDB]: player decoded', decoded)),
        )),
    )),
);


export const scanDiscordPlayers = () => pipe(
    DynamoDBDocument.scan({
        TableName: process.env.DDB_OPERATIONS,
        IndexName: 'GSI_ALL_PLAYERS',
    }),
    E.flatMap(({Items}) => pipe(
        E.if(Boolean(Items), {
            onTrue : () => E.all(pipe(Items!, mapL((Item) => decodeDiscordPlayer(Item)))),
            onFalse: () => E.succeed([] as DPlayer[]),
        }),
        E.flatMap((decoded) => pipe(
            E.succeed(decoded),
            E.tap(Console.log('[SCAN DDB]: players decoded', decoded)),
        )),
    )),
);


export const deleteDiscordPlayer = (key: CompKey<DPlayer>) => pipe(
    [encodeUserId(key.pk), encodePlayerTag(key.sk)],
    E.all,
    E.flatMap(([pk, sk]) => DynamoDBDocument.delete({
        TableName: process.env.DDB_OPERATIONS,
        Key      : {
            pk,
            sk,
        },
    })),
);
