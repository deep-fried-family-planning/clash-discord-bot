import {NowId, UserId, UserIdEncode} from '#src/dynamo/common.ts';
import {DynamoDBDocumentService} from '@effect-aws/lib-dynamodb';
import {CSL, E, pipe, S} from '#src/internals/re-exports/effect.ts';
import {DynamoError} from '#src/internals/errors/dynamo-error.ts';
import type {CompKey} from '#src/dynamo/dynamo.ts';

export type DUser = S.Schema.Type<typeof DiscordUser>;

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

export const DiscordUserDecode = S.decodeUnknown(DiscordUser);
export const DiscordUserEncode = S.encodeUnknown(DiscordUser);
export const DiscordUserEquivalence = S.equivalence(DiscordUser);

export const putDiscordUser = (record: DUser) => pipe(
    DiscordUserEncode(record),
    E.flatMap((encoded) => pipe(
        DynamoDBDocumentService.put({
            TableName: process.env.DDB_OPERATIONS,
            Item     : encoded,
        }),
        E.tap(CSL.log('[PUT DDB]: player encoded', encoded)),
    )),
);

export const getDiscordUser = (key: Pick<CompKey<DUser>, 'pk'>) => pipe(
    UserIdEncode(key.pk),
    E.flatMap((pk) => DynamoDBDocumentService.get({
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
