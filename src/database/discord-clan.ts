import {Console, Schema as S} from 'effect';
import {ClanTag, ClanTagEncode, ServerId, ServerIdEncode, ThreadId} from '#src/database/common.ts';
import {E, pipe} from '#src/internals/re-exports/effect.ts';
import {DynamoDBDocumentService} from '@effect-aws/lib-dynamodb';
import type {CompKey} from '#src/database/types.ts';
import {mapL} from '#src/pure/pure-list.ts';
import {DynamoError} from '#src/internals/errors/dynamo-error.ts';

export type DClan = S.Schema.Type<typeof DiscordClan>;

export const DiscordClan = S.Struct({
    type: S.Literal('DiscordClan'),

    pk: ServerId,
    sk: ClanTag,

    gsi_server_id: ServerId,
    gsi_clan_tag : ClanTag,

    version: S.Literal('1.0.0'),
    created: S.Date,
    updated: S.Date,

    thread_prep    : ThreadId,
    prep_opponent  : ClanTag,
    thread_battle  : ThreadId,
    battle_opponent: ClanTag,
    countdown      : ThreadId,
});

export const DiscordClanEncode = S.encodeUnknown(DiscordClan);
export const DiscordClanDecode = S.decodeUnknown(DiscordClan);

export const DiscordClanEquivalence = S.equivalence(DiscordClan);

export const putDiscordClan = (record: DClan) => pipe(
    DiscordClanEncode(record),
    E.flatMap((encoded) => pipe(
        DynamoDBDocumentService.put({
            TableName: process.env.DDB_OPERATIONS,
            Item     : encoded,
        }),
        E.tap(Console.log('[PUT DDB]: clan encoded', encoded)),
    )),
    E.as(record),
);

export const getDiscordClan = (key: CompKey<DClan>) => pipe(
    [ServerIdEncode(key.pk), ClanTagEncode(key.sk)],
    E.all,
    E.flatMap(([pk, sk]) => DynamoDBDocumentService.get({
        TableName: process.env.DDB_OPERATIONS,
        Key      : {
            pk,
            sk,
        },
        ConsistentRead: true,
    })),
    E.flatMap(({Item}) => pipe(
        E.if(Boolean(Item), {
            onTrue : () => DiscordClanDecode(Item),
            onFalse: () => new DynamoError({message: 'NotFound: DiscordClan'}),
        }),
        E.flatMap((decoded) => pipe(
            E.succeed(decoded),
            E.tap(Console.log('[GET DDB]: clan decoded', decoded)),
        )),
    )),
);

export const scanDiscordClans = () => pipe(
    DynamoDBDocumentService.scan({
        TableName: process.env.DDB_OPERATIONS,
        IndexName: 'GSI_ALL_CLANS',
    }),
    E.flatMap(({Items}) => pipe(
        E.if(Boolean(Items), {
            onTrue : () => E.all(pipe(Items!, mapL((Item) => DiscordClanDecode(Item)))),
            onFalse: () => E.succeed([]),
        }),
        E.flatMap((decoded) => pipe(
            E.succeed(decoded),
            E.tap(Console.log('[SCAN DDB]: clans decoded', decoded)),
        )),
    )),
);
