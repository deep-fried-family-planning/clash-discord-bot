import {Console, Schema as S} from 'effect';
import {PlayerTag, UserId} from '#src/database/common.ts';
import type {CompKey} from '#src/database/types.ts';
import {DynamoDBDocumentService} from '@effect-aws/lib-dynamodb';
import {E, pipe} from '#src/utils/effect.ts';
import {mapL} from '#src/pure/pure-list.ts';
import {DiscordServerDecode} from '#src/database/discord-server.ts';

export type DPlayer = S.Schema.Type<typeof DiscordPlayer>;

export const DiscordPlayer = S.Struct({
    pk: UserId,
    sk: PlayerTag,

    type   : S.Literal('DiscordPlayer'),
    version: S.Literal('1.0.0'),

    created: S.Date,
    updated: S.Date,

    gsi_user_id   : UserId,
    gsi_player_tag: PlayerTag,

    verification: S.Enums({
        none     : 0,
        admin    : 1,
        token    : 2,
        developer: 3,
    }),
});

export const DiscordPlayerDecode = S.decodeUnknown(DiscordPlayer);
export const DiscordPlayerEncode = S.encodeUnknown(DiscordPlayer);

export const DiscordPlayerEquivalence = S.equivalence(DiscordPlayer);

export const putDiscordPlayer = (record: DPlayer) => pipe(
    DiscordPlayerEncode(record),
    E.flatMap((encoded) => pipe(
        DynamoDBDocumentService.put({
            TableName: process.env.DDB_OPERATIONS,
            Item     : encoded,
        }),
        E.tap(Console.log('[PUT DDB]: player encoded', encoded)),
    )),
);

export const getDiscordPlayer = (key: CompKey<DPlayer>) => pipe(
    DynamoDBDocumentService.get({
        TableName: process.env.DDB_OPERATIONS,
        Key      : key,
    }),
    E.flatMap(({Item}) => pipe(
        E.if(Boolean(Item), {
            onTrue : () => DiscordPlayerDecode(Item),
            onFalse: () => E.succeed(undefined),
        }),
        E.flatMap((decoded) => pipe(
            E.succeed(decoded),
            E.tap(Console.log('[GET DDB]: player decoded', decoded)),
        )),
    )),
);

export const queryDiscordPlayer = (key: Pick<CompKey<DPlayer>, 'sk'>) => pipe(
    DynamoDBDocumentService.query({
        TableName                : process.env.DDB_OPERATIONS,
        IndexName                : 'GSI_ALL_PLAYERS',
        KeyConditionExpression   : 'gsi_player_tag = :gsi_player_tag',
        ExpressionAttributeValues: {
            ':gsi_player_tag': key.sk,
        },
    }),
    E.flatMap(({Items}) => pipe(
        E.if(Boolean(Items), {
            onTrue : () => E.all(pipe(Items!, mapL((Item) => DiscordPlayerDecode(Item)))),
            onFalse: () => E.succeed([undefined] as const),
        }),
        E.flatMap((decoded) => pipe(
            E.succeed(decoded),
            E.tap(Console.log('[QUERY DDB]: player decoded', decoded)),
        )),
    )),
);

export const scanDiscordPlayers = () => pipe(
    DynamoDBDocumentService.scan({
        TableName: process.env.DDB_OPERATIONS,
        IndexName: 'GSI_ALL_PLAYERS',
    }),
    E.flatMap(({Items}) => pipe(
        E.if(Boolean(Items), {
            onTrue : () => E.all(pipe(Items!, mapL((Item) => DiscordPlayerDecode(Item)))),
            onFalse: () => E.succeed([] as DPlayer[]),
        }),
        E.flatMap((decoded) => pipe(
            E.succeed(decoded),
            E.tap(Console.log('[SCAN DDB]: players decoded', decoded)),
        )),
    )),
);

export const deleteDiscordPlayer = (key: CompKey<DPlayer>) => pipe(
    DynamoDBDocumentService.delete({
        TableName: process.env.DDB_OPERATIONS,
        Key      : key,
    }),
);
