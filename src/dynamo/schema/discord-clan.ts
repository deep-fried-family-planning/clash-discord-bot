import {Console, Schema as S} from 'effect';
import {ClanTag, EmbedId, ServerId, ThreadId} from '#src/dynamo/schema/common.ts';
import {CSL, E, pipe} from '#src/internal/pure/effect.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {mapL} from '#src/internal/pure/pure-list.ts';
import {DynamoError} from '#src/internal/errors.ts';
import type {CompKey} from '#src/dynamo/dynamo.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {encodeClanTag, encodeServerId} from '#src/dynamo/schema/common-encoding.ts';


export const DiscordClan = S.Struct({
    type: S.Literal('DiscordClan'),

    pk: ServerId,
    sk: ClanTag,

    gsi_server_id: ServerId,
    gsi_clan_tag : ClanTag,

    version: S.Literal('1.0.0'),
    created: S.Date,
    updated: S.Date,

    embed_id: S.optional(EmbedId),

    verification: S.Enums({
        admin    : 0,
        elder    : 1,
        coleader : 2,
        leader   : 3,
        developer: 4,
    }).pipe(S.optionalWith({default: () => 0})),

    name : S.String.pipe(S.optionalWith({default: () => ''})),
    alias: S.String.pipe(S.optionalWith({default: () => ''})),
    desc : S.String.pipe(S.optionalWith({default: () => ''})),
    uses : S.Array(S.String).pipe(S.optionalWith({default: () => [] as str[]})),

    thread_prep    : ThreadId,
    prep_opponent  : ClanTag,
    thread_battle  : ThreadId,
    battle_opponent: ClanTag,
    countdown      : ThreadId,
});
export type DClan = S.Schema.Type<typeof DiscordClan>;


export const encodeDiscordClan = S.encodeUnknown(DiscordClan);
export const decodeDiscordClan = S.decodeUnknown(DiscordClan);


export const putDiscordClan = (record: DClan) => pipe(
    encodeDiscordClan(record),
    E.flatMap((encoded) => pipe(
        DynamoDBDocument.put({
            TableName: process.env.DDB_OPERATIONS,
            Item     : encoded,
        }),
        E.tap(Console.log('[PUT DDB]: clan encoded', encoded)),
    )),
    E.as(record),
);


export const getDiscordClan = (key: CompKey<DClan>) => pipe(
    [encodeServerId(key.pk), encodeClanTag(key.sk)],
    E.all,
    E.flatMap(([pk, sk]) => pipe(
        DynamoDBDocument.get({
            TableName: process.env.DDB_OPERATIONS,
            Key      : {
                pk,
                sk,
            },
            ConsistentRead: true,
        }),
        E.tap(CSL.log('encoded', pk, sk)),
    )),
    E.flatMap(({Item}) => pipe(
        E.if(Boolean(Item), {
            onTrue : () => decodeDiscordClan(Item),
            onFalse: () => new DynamoError({message: 'NotFound: DiscordClan'}),
        }),
        E.flatMap((decoded) => pipe(
            E.succeed(decoded),
            E.tap(Console.log('[GET DDB]: clan decoded', decoded)),
        )),
    )),
);


export const queryDiscordClanForServer = (key: Pick<CompKey<DClan>, 'pk'>) => pipe(
    encodeServerId(key.pk),
    E.flatMap((pk) => DynamoDBDocument.query({
        TableName                : process.env.DDB_OPERATIONS,
        KeyConditionExpression   : 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
            ':pk': pk,
            ':sk': 'c-',
        },
    })),
    E.flatMap(({Items}) => pipe(
        E.if(Boolean(Items), {
            onTrue : () => E.all(pipe(Items!, mapL((Item) => decodeDiscordClan(Item)))),
            onFalse: () => E.succeed([] as const),
        }),
        E.flatMap((decoded) => pipe(
            E.succeed(decoded),
            E.tap(Console.log('[QUERY DDB]: clan decoded', decoded)),
        )),
    )),
);


export const queryDiscordClan = (key: Pick<CompKey<DClan>, 'sk'>) => pipe(
    encodeClanTag(key.sk),
    E.flatMap((sk) => DynamoDBDocument.query({
        TableName                : process.env.DDB_OPERATIONS,
        IndexName                : 'GSI_ALL_CLANS',
        KeyConditionExpression   : 'gsi_clan_tag = :gsi_clan_tag',
        ExpressionAttributeValues: {
            ':gsi_clan_tag': sk,
        },
    })),
    E.flatMap(({Items}) => pipe(
        E.if(Boolean(Items), {
            onTrue : () => E.all(pipe(Items!, mapL((Item) => decodeDiscordClan(Item)))),
            onFalse: () => E.succeed([undefined] as const),
        }),
        E.flatMap((decoded) => pipe(
            E.succeed(decoded),
            E.tap(Console.log('[QUERY DDB]: clan decoded', decoded)),
        )),
    )),
);


export const scanDiscordClans = () => pipe(
    DynamoDBDocument.scan({
        TableName: process.env.DDB_OPERATIONS,
        IndexName: 'GSI_ALL_CLANS',
    }),
    E.flatMap(({Items}) => pipe(
        E.if(Boolean(Items), {
            onTrue : () => E.all(pipe(Items!, mapL((Item) => decodeDiscordClan(Item)))),
            onFalse: () => E.succeed([]),
        }),
        E.flatMap((decoded) => pipe(
            E.succeed(decoded),
            E.tap(Console.log('[SCAN DDB]: clans decoded', decoded)),
        )),
    )),
);


export const deleteDiscordClan = (key: CompKey<DClan>) => pipe(
    [encodeServerId(key.pk), encodeClanTag(key.sk)],
    E.all,
    E.flatMap(([pk, sk]) => DynamoDBDocument.delete({
        TableName: process.env.DDB_OPERATIONS,
        Key      : {
            pk,
            sk,
        },
    })),
);
