import {E, g, Kv, L, pipe} from '#pure/effect';
import {NONE} from '#src/internal/disreact/entity/constants.ts';
import {Err, Root} from '#src/internal/disreact/entity/index.ts';
import type {KeyNamedRoots} from '#src/internal/disreact/entity/root.ts';
import type {rec, str} from '#src/internal/pure/types-pure.ts';
import type {EAR} from '#src/internal/types.ts';
import {inspect} from 'node:util';


const implementation = (
  config: {
    roots: KeyNamedRoots;
  },
) => E.gen(function * () {
  const roots = {} as rec<Root.Root>;

  if (!Kv.toEntries(config.roots).length) {
    return yield * new Err.DevMistake();
  }

  for (const name in config.roots) {
    roots[name] = pipe(
      Root.createRoot(config.roots[name], name),
      Root.recurseFromRoot,
    );
  }

  yield * E.logDebug('[Router]', inspect(roots, true, null, true));

  return {
    getNode: (root: str, node: str) => g(function * () {
      if (!(root in roots)) {
        return yield * new Err.NodeNotFound();
      }

      if (node === NONE) {
        return roots[root];
      }

      if (!(node in roots[root].children)) {
        return yield * new Err.NodeNotFound();
      }

      return roots[root];
    }),
  };
});


export class NodeManager extends E.Tag('InteractionRouter')<
  NodeManager,
  EAR<typeof implementation>
>() {
  static makeLayer = (
    roots: KeyNamedRoots,
  ) => L.effect(this, implementation({roots}));
}
