import {getDiscordClan, scanDiscordClans} from '#src/dynamo/schema/discord-clan.ts';
import {C, CSL, E, L, pipe} from '#src/internal/pure/effect.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';
import type {EA} from '#src/internal/types.ts';


const cache = E.gen(function* () {
    const cache = yield * C.make({
        capacity  : 50,
        timeToLive: process.env.LAMBDA_ENV === 'qual'
            ? '1 minutes'
            : '15 minutes',

        lookup: (key: `${string}/${string}`) => E.gen(function* () {
            yield * CSL.log('cache miss!');

            const [pk, sk] = key.split('/');

            const record = yield * getDiscordClan({pk, sk});

            return record;
        }),
    });

    const clans = yield * scanDiscordClans();

    yield * pipe(
        clans,
        mapL((clan) => cache.set(`${clan.pk}/${clan.sk}`, clan)),
        E.allWith({concurrency: 'unbounded'}),
    );

    return cache;
});

export class ClanCache extends E.Tag('DeepFryerClanCache')<
    ClanCache,
    EA<typeof cache>
>() {
    static Live = L.effect(this, cache);
}
