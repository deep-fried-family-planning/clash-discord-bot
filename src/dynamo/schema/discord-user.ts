import type {CompKey} from '#src/dynamo/dynamo.ts';
import {encodeUserId} from '#src/dynamo/schema/common-encoding.ts';
import {EmbedId, NowId, UserId} from '#src/dynamo/schema/common.ts';
import {DynamoError} from '#src/internal/errors.ts';
import {CSL, E, pipe, S} from '#src/internal/pure/effect.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';


export const DiscordUser = S.Struct({
    pk     : UserId,
    sk     : NowId,
    type   : S.Literal('DiscordUser'),
    version: S.Literal('1.0.0'),
    created: S.Date,
    updated: S.Date,

    gsi_all_user_id: UserId,

    embed_id: S.optional(EmbedId),

    timezone: S.TimeZone,

    quiet: S.optional(S.String),
});
export type DUser = S.Schema.Type<typeof DiscordUser>;


export const decodeDiscordUser = S.decodeUnknown(DiscordUser);
export const encodeDiscordUser = S.encodeUnknown(DiscordUser);


export const putDiscordUser = (record: DUser) => pipe(
    encodeDiscordUser(record),
    E.flatMap((encoded) => pipe(
        DynamoDBDocument.put({
            TableName: process.env.DDB_OPERATIONS,
            Item     : encoded,
        }),
        E.tap(CSL.log('[PUT DDB]: player encoded', encoded)),
    )),
);


export const getDiscordUser = (key: Pick<CompKey<DUser>, 'pk'>) => pipe(
    encodeUserId(key.pk),
    E.flatMap((pk) => DynamoDBDocument.get({
        TableName: process.env.DDB_OPERATIONS,
        Key      : {
            pk: pk,
            sk: 'now',
        },
    })),
    E.flatMap(({Item}) => pipe(
        E.if(Boolean(Item), {
            onTrue : () => decodeDiscordUser(Item),
            onFalse: () => new DynamoError({message: 'NotFound: DiscordUser'}),
        }),
        E.flatMap((decoded) => pipe(
            E.succeed(decoded),
            E.tap(CSL.log('[GET DDB]: player decoded', decoded)),
        )),
    )),
);
