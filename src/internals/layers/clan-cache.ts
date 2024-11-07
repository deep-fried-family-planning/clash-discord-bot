import {Cache, Console, Context, Effect, Layer} from 'effect';
import {getDiscordClan, scanDiscordClans} from '#src/database/discord-clan.ts';
import {E, pipe} from '#src/internals/re-exports/effect.ts';
import {mapL} from '#src/pure/pure-list.ts';

export class ClanCache extends Context.Tag('DeepFryerClanCache')<
    ClanCache,
    typeof clanCache
>() {}

// todo
// cache timing at scale
const clanCache = Cache.make({
    capacity  : 50,
    timeToLive: process.env.LAMBDA_ENV === 'qual'
        ? '1 minutes'
        : '15 minutes',

    lookup: (key: `${string}/${string}`) => Effect.gen(function* () {
        yield * Console.log('cache miss!');

        const [pk, sk] = key.split('/');

        const record = yield * getDiscordClan({pk, sk});

        return record;
    }),
});

export const ClanCacheLive = Layer.effect(
    ClanCache,
    Effect.gen(function* () {
        const cache = yield * clanCache;

        const clans = yield * scanDiscordClans();

        yield * pipe(
            clans,
            mapL((clan) => cache.set(`${clan.pk}/${clan.sk}`, clan)),
            E.allWith({concurrency: 'unbounded'}),
        );

        return E.succeed(cache);
    }),
);
