import {Effect, Cache, Duration, Console} from 'effect';
import {ddbGetPlayerLinks} from '#src/database/codec/player-links-ddb.ts';
import {getServer} from '#src/database/server/get-server.ts';

export const PLAYER_LINK_PLACEHOLDER_KEY = 'key';

export const playerLinkCache = await Effect.runPromise(Cache.make({
    capacity  : 50,
    timeToLive: Duration.minutes(15),

    lookup: () => Effect.gen(function* () {
        const record = yield * Effect.promise(() => ddbGetPlayerLinks());

        return record!;
    }),
}));

export const serverCache = await Effect.runPromise(Cache.make({
    capacity  : 50,
    timeToLive: '15 minutes',

    lookup: (key: string) => Effect.gen(function* () {
        const record = yield * Effect.tryPromise(async () => await getServer(key));

        yield * Console.log('cache miss!');

        return record!;
    }),
}));
