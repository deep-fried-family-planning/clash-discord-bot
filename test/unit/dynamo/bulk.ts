import {E} from '#src/internal/pure/effect.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {SlashUserError} from '#src/internal/errors.ts';
import {deleteDiscordPlayer, type DPlayer, putDiscordPlayer, queryDiscordPlayer} from '#src/dynamo/schema/discord-player.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export const bulk = (intag: str, user: str) => E.gen(function * () {
    const tag = yield * Clashofclans.validateTag(intag);

    const coc_player = yield * Clashofclans.getPlayer(tag);

    const [player, ...rest] = yield * queryDiscordPlayer({sk: `p-${tag}`});

    // new player record
    if (!player) {
        return yield * putDiscordPlayer(makeDiscordPlayer(user, coc_player.tag, 2, 'main'));
    }

    if (rest.length) {
        return yield * new SlashUserError({issue: 'real bad, this should never happen. call support lol'});
    }

    yield * deleteDiscordPlayer({pk: player.pk, sk: player.sk});
    yield * putDiscordPlayer({
        ...player,
        pk          : user,
        gsi_user_id : user,
        updated     : new Date(Date.now()),
        verification: 2,
    });
});


const makeDiscordPlayer
    = (userId: string, playerTag: string, verification: DPlayer['verification'], accountType?: string) => ({
        pk            : userId,
        sk            : playerTag,
        type          : 'DiscordPlayer',
        version       : '1.0.0',
        created       : new Date(Date.now()),
        updated       : new Date(Date.now()),
        gsi_user_id   : userId,
        gsi_player_tag: playerTag,
        verification  : verification,
        account_type  : accountType ?? 'main',
    } as const);
