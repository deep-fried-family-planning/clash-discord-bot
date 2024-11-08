import {Console, Schema as S} from 'effect';
import {NowId, UserId, UserIdEncode} from '#src/database/common.ts';
import type {CompKey} from '#src/database/types.ts';
import {DynamoDBDocumentService} from '@effect-aws/lib-dynamodb';
import {E, pipe} from '#src/internals/re-exports/effect.ts';
import {DynamoError} from '#src/internals/errors/dynamo-error.ts';

export type DUser = S.Schema.Type<typeof DiscordUser>;

export const DiscordUser = S.Struct({
    type   : S.Literal('DiscordUser'),
    pk     : UserId,
    sk     : NowId,
    version: S.Literal('1.0.0'),
    created: S.Date,
    updated: S.Date,

    timezone: S.TimeZone,
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
        E.tap(Console.log('[PUT DDB]: player encoded', encoded)),
    )),
);

export const getDiscordUser = (key: Pick<CompKey<DUser>, 'pk'>) => pipe(
    UserIdEncode(key.pk),
    E.andThen(DynamoDBDocumentService.get({
        TableName: process.env.DDB_OPERATIONS,
        Key      : {
            pk: key.pk,
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
            E.tap(Console.log('[GET DDB]: player decoded', decoded)),
        )),
    )),
);
