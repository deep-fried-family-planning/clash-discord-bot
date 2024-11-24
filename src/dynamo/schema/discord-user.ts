import {NowId, UserId, UserIdEncode} from '#src/dynamo/schema/common.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {CSL, E, pipe, S} from '#src/internal/pure/effect.ts';
import {DynamoError} from '#src/internal/errors.ts';
import type {CompKey} from '#src/dynamo/dynamo.ts';


export const DiscordUser = S.Struct({
    pk     : UserId,
    sk     : NowId,
    type   : S.Literal('DiscordUser'),
    version: S.Literal('1.0.0'),
    created: S.Date,
    updated: S.Date,

    gsi_all_user_id: UserId,

    timezone: S.TimeZone,
    quiet   : S.optional(S.String),
});
export type DUser = S.Schema.Type<typeof DiscordUser>;


export const DiscordUserDecode = S.decodeUnknown(DiscordUser);
export const DiscordUserEncode = S.encodeUnknown(DiscordUser);
export const DiscordUserEquivalence = S.equivalence(DiscordUser);


export const putDiscordUser = (record: DUser) => pipe(
    DiscordUserEncode(record),
    E.flatMap((encoded) => pipe(
        DynamoDBDocument.put({
            TableName: process.env.DDB_OPERATIONS,
            Item     : encoded,
        }),
        E.tap(CSL.log('[PUT DDB]: player encoded', encoded)),
    )),
);


export const getDiscordUser = (key: Pick<CompKey<DUser>, 'pk'>) => pipe(
    UserIdEncode(key.pk),
    E.flatMap((pk) => DynamoDBDocument.get({
        TableName: process.env.DDB_OPERATIONS,
        Key      : {
            pk: pk,
            sk: 'now',
        },
    })),
    E.flatMap(({Item}) => pipe(
        E.if(Boolean(Item), {
            onTrue : () => DiscordUserDecode(Item),
            onFalse: () => new DynamoError({message: 'NotFound: DiscordUser'}),
        }),
        E.flatMap((decoded) => pipe(
            E.succeed(decoded),
            E.tap(CSL.log('[GET DDB]: player decoded', decoded)),
        )),
    )),
);
