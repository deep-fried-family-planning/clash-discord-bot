import {Doken} from '#src/disreact/abstract/index.ts';
import {DokenMemory} from '#src/disreact/interface/service.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import {Cache, type Duration, pipe} from 'effect';



export type LocalDokenMemoryConfig = {
  capacity?  : number;
  timeToLive?: Duration.DurationInput;
};



export const makeLocalDokenMemory = (config: LocalDokenMemoryConfig) => pipe(
  L.effect(DokenMemory, E.gen(function * () {
    const cache = yield * Cache.make({
      capacity  : config.capacity ?? 1000,
      timeToLive: config.timeToLive ?? '12 minutes',
      lookup    : () => E.succeed(Doken.makeEmpty()),
    });

    return {
      kind   : 'local' as const,
      save   : (doken) => cache.set(doken.id, doken),
      load   : (id) => cache.get(id),
      free   : (id) => cache.invalidate(id),
      memSave: (doken) => cache.set(doken.id, doken),
      memLoad: (id) => cache.get(id),
      memFree: (id) => cache.invalidate(id),
    };
  })),
  L.memoize,
);
