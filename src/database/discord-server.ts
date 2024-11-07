import {Console} from 'effect';
import {NowId, ChannelId, RoleId, ServerId, ServerIdEncode} from '#src/database/common.ts';
import type {CompKey} from '#src/database/types.ts';
import {DynamoDBDocumentService} from '@effect-aws/lib-dynamodb';
import {E, S, pipe} from '#src/internals/re-exports/effect.ts';
import {mapL} from '#src/pure/pure-list.ts';
import {DynamoError} from '#src/internals/errors/dynamo-error.ts';

export type DServer = S.Schema.Type<typeof DiscordServer>;

export const DiscordServer = S.Struct({
    pk: ServerId,
    sk: NowId,

    type   : S.Literal('DiscordServer'),
    version: S.Literal('1.0.0'),
    created: S.Date,
    updated: S.Date,

    gsi_all_server_id: ServerId,

    polling : S.Boolean,
    timezone: S.optional(S.TimeZone),

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

export const getDiscordServer = (key: CompKey<DServer>) => pipe(
    ServerIdEncode(key.pk),
    E.andThen(DynamoDBDocumentService.get({
        TableName     : process.env.DDB_OPERATIONS,
        Key           : key,
        ConsistentRead: true,
    })),
    E.flatMap(({Item}) => pipe(
        E.if(Boolean(Item), {
            onTrue : () => DiscordServerDecode(Item!),
            onFalse: () => new DynamoError({message: 'NotFound: DiscordServer'}),
        }),
        E.flatMap((decoded) => pipe(
            E.succeed(decoded),
            E.tap(Console.log('[GET DDB]: server decoded', decoded)),
        )),
    )),
);

export const scanDiscordServers = () => pipe(
    DynamoDBDocumentService.scan({
        TableName: process.env.DDB_OPERATIONS,
        IndexName: 'GSI_ALL_SERVERS',
    }),
    E.flatMap(({Items}) => pipe(
        E.if(Boolean(Items), {
            onTrue : () => E.all(pipe(Items!, mapL((Item) => DiscordServerDecode(Item)))),
            onFalse: () => E.succeed([]),
        }),
        E.flatMap((decoded) => pipe(
            E.succeed(decoded),
            E.tap(Console.log('[SCAN DDB]: servers decoded', decoded)),
        )),
    )),
);
