import type {CompKey} from '#src/dynamo/dynamo.ts';
import {type DServer, getDiscordServer, scanDiscordServers} from '#src/dynamo/schema/discord-server.ts';
import {C, CSL, E, L, pipe} from '#src/internal/pure/effect.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';
import type {EA} from '#src/internal/types.ts';

const cache = E.gen(function* () {
  const cache = yield* C.make({
    capacity  : 50,
    timeToLive: process.env.LAMBDA_ENV === 'qual'
      ? '1 minutes'
      : '15 minutes',

    lookup: (key: CompKey<DServer>['pk']) => E.gen(function* () {
      yield* CSL.log('cache miss!');

      const record = yield* getDiscordServer({pk: key, sk: 'now'});

      return record;
    }),
  });

  const servers = yield* scanDiscordServers();

  yield* pipe(
    servers,
    mapL((server) => cache.set(server.pk, server)),
    E.allWith({concurrency: 'unbounded'}),
  );

  return cache;
});

export class ServerCache extends E.Tag('DeepFryerServerCache')<
  ServerCache,
  EA<typeof cache>
>() {
  static Live = L.effect(this, cache);
}
