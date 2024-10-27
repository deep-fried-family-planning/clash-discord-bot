import {Schema as S} from 'effect';
import {PlayerTag, UserId} from '#src/database/common.ts';

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
