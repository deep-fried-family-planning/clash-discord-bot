import {Console, Schema as S} from 'effect';
import {ChannelId, RoleId, ServerId} from '#src/database/common.ts';
import type {CompKey} from '#src/database/types.ts';
import {DynamoDBDocumentService} from '@effect-aws/lib-dynamodb';
import {E, pipe} from '#src/utils/effect.ts';

export type DServer = S.Schema.Type<typeof DiscordServer>;

export const DiscordServer = S.Struct({
    pk: ServerId,
    sk: S.Literal('now'),

    type   : S.Literal('DiscordServer'),
    version: S.Literal('1.0.0'),
    created: S.Date,
    updated: S.Date,

    gsi_server_id: ServerId,

    polling: S.Boolean,

    announcements: S.optional(ChannelId),
    info         : S.optional(ChannelId),
    general      : S.optional(ChannelId),
    slash        : S.optional(ChannelId),
    staff        : S.optional(ChannelId),
    forum        : S.optional(ChannelId),
    errors       : S.optional(ChannelId),

    admin : RoleId,
    member: S.optional(RoleId),
    guest : S.optional(RoleId),
});

export const DiscordServerEquivalence = S.equivalence(DiscordServer);
export const DiscordServerEncode = S.encodeUnknown(DiscordServer);
export const DiscordServerDecode = S.decodeUnknown(DiscordServer);

export const putDiscordServer = (record: DServer) => pipe(
    DiscordServerEncode(record),
    E.flatMap((encoded) => pipe(
        DynamoDBDocumentService.put({
            TableName: process.env.DDB_OPERATIONS,
            Item     : encoded,
        }),
        E.tap(Console.log('[PUT DDB]: server encoded', encoded)),
    )),
);

export const getDiscordServer = (key: CompKey<DServer>) => DynamoDBDocumentService
    .get({
        TableName: process.env.DDB_OPERATIONS,
        Key      : key,
    })
    .pipe(E.flatMap(({Item}) => pipe(
        E.if(Boolean(Item), {
            onTrue : () => DiscordServerDecode(Item),
            onFalse: () => E.succeed(undefined),
        }),
        E.flatMap((decoded) => pipe(
            E.succeed(decoded),
            E.tap(Console.log('[GET DDB]: server decoded', decoded)),
        )),
    )));

export const failGetDiscordServer = (decoded?: DServer) => E.if(Boolean(decoded), {
    onTrue : () => E.succeed(decoded!),
    onFalse: () => E.fail(new Error('the current server is not recognized')),
});
