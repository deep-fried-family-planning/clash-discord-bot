import {E, g, Kv, L, pipe} from '#pure/effect';
import {NONE} from '#src/internal/disreact/entity/constants.ts';
import {Err, Root} from '#src/internal/disreact/entity/index.ts';
import type {KeyNamedRoots} from '#src/internal/disreact/entity/root.ts';
import type {rec, str} from '#src/internal/pure/types-pure.ts';
import type {EAR} from '#src/internal/types.ts';


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

  const semaphore = yield * E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);

  return {
    getNode: (root: str, node: str) => mutex(g(function * () {
      if (!(root in roots)) {
        return yield * new Err.NodeNotFound();
      }

      if (node === NONE || root === node) {
        yield * E.logTrace(`root ${root} ${node}`);
        return roots[root];
      }

      if (!(node in roots[root].children)) {
        return yield * new Err.NodeNotFound();
      }

      yield * E.logTrace(`child ${root} ${node}`);
      return roots[root].children[node];
    })),
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
