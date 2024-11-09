import {Cache, Console, Context, Effect, Layer} from 'effect';
import type {CompKey} from '#src/database/types.ts';
import {E, pipe} from '#src/internals/re-exports/effect.ts';
import {mapL} from '#src/pure/pure-list.ts';
import {type DServer, getDiscordServer, scanDiscordServers} from '#src/database/discord-server.ts';

export class ServerCache extends Context.Tag('DeepFryerServerCache')<
    ServerCache,
    typeof serverCache
>() {}

const serverCache = Cache.make({
    capacity  : 50,
    timeToLive: process.env.LAMBDA_ENV === 'qual'
        ? '1 minutes'
        : '15 minutes',

    lookup: (key: CompKey<DServer>['pk']) => Effect.gen(function* () {
        yield * Console.log('cache miss!');

        const record = yield * getDiscordServer({pk: key, sk: 'now'});

        return record;
    }),
});

export const ServerCacheLive = Layer.effect(
    ServerCache,
    E.gen(function* () {
        const cache = yield * serverCache;

        const servers = yield * scanDiscordServers();

        yield * pipe(
            servers,
            mapL((server) => cache.set(server.pk, server)),
            E.allWith({concurrency: 'unbounded'}),
        );

        return E.succeed(cache);
    }),
);
