import {E, pipe} from '#src/internal/pure/effect.ts';
import {Cache} from 'effect';
import type {FiberHash, RootElement} from '#src/disreact/codec/element/index.ts';
import type { Root } from 'src/disreact/model/entity/root.ts';



const memCache = Cache.make({
  capacity  : 100,
  timeToLive: '5 minutes',
  lookup    : () => E.succeed(null as null | Root),
});

export class RootMemory extends E.Service<RootMemory>()('disreact/RootMemory', {
  accessors: true,

  effect: pipe(
    memCache,
    E.map((cache) => ({
      save: (key: string, root: Root) => cache.set(key, root),

      load: (key: string, hash: FiberHash.Encoded) =>
        pipe(
          cache.get(key),
          E.map((root) => {
            if (!root) {
              return null;
            }
            return null;
          }),
        ),
    })),
  ),
}) {}
