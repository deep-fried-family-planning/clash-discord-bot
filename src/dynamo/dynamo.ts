import {decodeDiscordServer, DiscordServer} from '#src/dynamo/schema/discord-server.ts';
import {
    encodeClanTag,
    encodeNowId,
    encodePlayerTag,
    encodeServerId,
    encodeUserId,
} from '#src/dynamo/schema/common-encoding.ts';
import {decodeDiscordUser, DiscordUser} from '#src/dynamo/schema/discord-user.ts';
import {decodeDiscordPlayer, DiscordPlayer} from '#src/dynamo/schema/discord-player.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {g} from '#src/internal/pure/effect.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {DynamoError} from '#src/internal/errors.ts';
import type {EAR} from '#src/internal/types.ts';
import {decodeDiscordClan} from '#src/dynamo/schema/discord-clan.ts';
import {Match} from 'effect';


export type CompKey<T extends {pk: unknown; sk: unknown}> = Pick<T, 'pk' | 'sk'> & {
    pk: string;
    sk: string;
};


const schema = {
    DiscordServer: {
        pk    : encodeServerId,
        sk    : encodeNowId,
        schema: decodeDiscordServer,
    },
    DiscordClan: {
        pk    : encodeServerId,
        sk    : encodeClanTag,
        schema: decodeDiscordClan,
    },
    DiscordUser: {
        pk    : encodeUserId,
        sk    : encodeNowId,
        schema: decodeDiscordUser,
    },
    DiscordPlayer: {
        pk    : encodeUserId,
        sk    : encodePlayerTag,
        schema: decodeDiscordPlayer,
    },
} as const;


type DDB = typeof schema;


export const ddbRead = <
    K extends keyof DDB,
>(
    kind: K,
    pk: str,
    sk: str,
) => g(function * () {
    const params = schema[kind];

    const p = yield * params.pk(pk);
    const s = yield * params.sk(sk);

    const record = yield * DynamoDBDocument.get({
        TableName: process.env.DDB_OPERATIONS,
        Key      : {
            pk: p,
            sk: s,
        },
    });

    if (!record.Item) {
        return yield * new DynamoError({
            message: `[${kind}]: Not found`,
        });
    }

    return yield * params.schema(record.Item as EAR<DDB[K]['schema']>) as ReturnType<DDB[K]['schema']>;
});
