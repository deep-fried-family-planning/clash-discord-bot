import {describe} from 'vitest';
import {it} from '@effect/vitest';
import {g, ORD, ORDN, ORDNR, pipe} from '#src/internal/pure/effect.ts';
import {Effect} from 'effect';
import {LambdaLive} from '#src/poll.ts';
import {OPPONENT_BATTLE} from './war-info.data.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {joinL, mapL, sortByL} from '#src/internal/pure/pure-list.ts';

describe('war info', () => {
    it.live('war info', () => g(function * () {
        const war = OPPONENT_BATTLE;

        const opponents = pipe(
            war.opponent.members,
            sortByL(ORD.mapInput(ORDN, (m) => m.mapPosition)),
            mapL((m, idx) => ({
                ...m,
                real: idx + 1,
            })),
        );


        yield * DiscordApi.createMessage('1298154183777583165', {
            content: pipe(
                war.clan.members,
                sortByL(ORD.mapInput(ORDN, (m) => m.mapPosition)),
                mapL((m, idx) => `${idx + 1}. ${m.name}: ${opponents.find((o) => o.tag === m.attacks?.[0]?.defenderTag)?.real}`),
                joinL('\n'),
            ),
        });
    }).pipe(
        Effect.provide(LambdaLive),
    ));
});
