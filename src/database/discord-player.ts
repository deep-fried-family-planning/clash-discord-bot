import {Schema as S} from 'effect';
import {PlayerTag, UserId} from '#src/database/common.ts';
import type {CompKey} from '#src/database/types.ts';
import {DynamoDBDocumentService} from '@effect-aws/lib-dynamodb';
import {E, pipe} from '#src/utils/effect.ts';

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

export const putDiscordPlayer = (record: DPlayer) => DynamoDBDocumentService.put({
    TableName: process.env.DDB_OPERATIONS,
    Item     : record,
});

export const getDiscordPlayer = (key: CompKey<DPlayer>) => pipe(
    DynamoDBDocumentService.query({
        TableName: process.env.DDB_OPERATIONS,
        IndexName: '',

        Key      : key,
    }),
    E.flatMap(({Item}) => DiscordPlayerDecode(Item)),
);

export const getDiscordPlayerByGSI = ()
