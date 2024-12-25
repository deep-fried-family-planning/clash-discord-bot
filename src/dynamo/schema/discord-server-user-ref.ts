import {PlayerTag, ServerUserRefId, UserId} from '#src/dynamo/schema/common.ts';
import {S} from '#src/internal/pure/effect.ts';


export type DServerUserRef = S.Schema.Type<typeof DiscordServerUserRef>;


export const DiscordServerUserRef = S.Struct({
    pk: ServerUserRefId,
    sk: UserId,

    type   : S.Literal('DiscordServerUserRef'),
    version: S.Literal('1.0.0'),
    created: S.DateTimeUtcFromNumber,
    updated: S.DateTimeUtcFromNumber,
    ttl    : S.DateTimeUtcFromNumber,

    accounts: S.Array(S.Struct({
        player_tag  : PlayerTag,
        verification: S.Number,
    })),
});
