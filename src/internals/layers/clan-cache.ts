import {Cache, Console, Context, Effect, Layer} from 'effect';
import type {CompKey} from '#src/database/types.ts';
import {type DClan, getDiscordClan, scanDiscordClans} from '#src/database/discord-clan.ts';
import {E, pipe} from '#src/utils/effect.ts';
import {mapL} from '#src/pure/pure-list.ts';

export class ClanCache extends Context.Tag('DeepFryerClanCache')<
    ClanCache,
    typeof clanCache
>() {}

const clanCache = Cache.make({
    capacity  : 50,
    timeToLive: process.env.LAMBDA_ENV === 'qual'
        ? '1 minutes'
        : '15 minutes',

    // todo ask in the Effect-TS server if this is referential equality...
    lookup: (key: CompKey<DClan>) => Effect.gen(function* () {
        yield * Console.log('cache miss!');

        const record = yield * getDiscordClan(key);

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
            mapL((clan) => cache.set({pk: clan.pk, sk: clan.sk}, clan)),
            E.allWith({concurrency: 'unbounded'}),
        );

        return E.succeed(cache);
    }),
);
