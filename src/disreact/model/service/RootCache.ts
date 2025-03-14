import {DsxSettings} from '#src/disreact/external/DisReactConfig.ts';
import type { Root} from '#src/disreact/model/entity/root.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {Cache} from 'effect';



export class RootCache extends E.Service<RootCache>()('disreact/RootCache', {
  accessors: true,

  effect: pipe(
    DsxSettings,
    E.flatMap(() =>
      Cache.make({
        capacity  : 100,
        timeToLive: '5 minutes',
        lookup    : () => E.succeed(null as null | Root),
      }),
    ),
    E.map((cache) => ({
      save: (key: string, root: Root) => cache.set(key, root),
      load: (key: string, hash: string) =>
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
