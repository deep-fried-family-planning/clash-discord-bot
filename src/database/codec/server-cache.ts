import {Effect, Cache, Duration} from 'effect';
import {getServer} from '#src/database/server/get-server.ts';
import {ddbGetPlayerLinks} from '#src/database/codec/player-links-ddb.ts';

const timeConsumingEffect = (key: string) =>
    Effect.sleep('2 seconds').pipe(Effect.as(key.length));

const program = Effect.gen(function* () {
    const cache = yield * Cache.make({
        capacity  : 100,
        timeToLive: Duration.infinity,
        lookup    : timeConsumingEffect,
    });
    const result = yield * cache
        .get('key1')
        .pipe(
            Effect.zip(cache.get('key1'), {concurrent: true}),
            Effect.zip(cache.get('key1'), {concurrent: true}),
        );
    console.log(
        `Result of parallel execution of three effects with the same key: ${result}`,
    );

    const hits = yield * cache.cacheStats.pipe(Effect.map((_) => _.hits));
    const misses = yield * cache.cacheStats.pipe(Effect.map((_) => _.misses));
    console.log(`Number of cache hits: ${hits}`);
    console.log(`Number of cache misses: ${misses}`);
});

export const server = Effect.runSync(Cache.make({
    capacity  : 50,
    timeToLive: Duration.minutes(15),

    lookup: (key: string) => Effect.gen(function* () {
        const record = yield * Effect.promise(() => getServer(key));
    }),
}));

export const playerLinkCache = Effect.runSync(Cache.make({
    capacity  : 50,
    timeToLive: Duration.minutes(15),

    lookup: () => Effect.gen(function* () {
        const record = yield * Effect.promise(() => ddbGetPlayerLinks());
    }),
}));
