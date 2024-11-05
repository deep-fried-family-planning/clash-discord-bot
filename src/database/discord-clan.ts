import {Console, Schema as S} from 'effect';
import {ClanTag, ServerId, ThreadId} from '#src/database/common.ts';
import {E, pipe} from '#src/utils/effect.ts';
import {DynamoDBDocumentService} from '@effect-aws/lib-dynamodb';
import type {CompKey} from '#src/database/types.ts';
import {mapL} from '#src/pure/pure-list.ts';

export type DClan = S.Schema.Type<typeof DiscordClan>;

export const DiscordClan = S.Struct({
    pk: ServerId,
    sk: ClanTag,

    type   : S.Literal('DiscordClan'),
    version: S.Literal('1.0.0'),
    created: S.Date,
    updated: S.Date,

    gsi_server_id: ServerId,
    gsi_clan_tag : ClanTag,

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
);

export const getDiscordClan = (key: CompKey<DClan>) => pipe(
    DynamoDBDocumentService.get({
        TableName     : process.env.DDB_OPERATIONS,
        Key           : key,
        ConsistentRead: true,
    }),
    E.flatMap(({Item}) => pipe(
        E.if(Boolean(Item), {
            onTrue : () => DiscordClanDecode(Item),
            onFalse: () => E.succeed(undefined),
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
