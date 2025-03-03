import * as FiberHash from '#src/disreact/codec/fiber/fiber-hash.ts';
import * as TreeRoot from '#src/disreact/codec/tree/root.ts';
import {C, E, L, pipe} from '#src/internal/pure/effect.ts';


const make = E.gen(function* () {
  const roots = new Map<string, TreeRoot.T>();

  const cache = yield* C.make({
    capacity  : 100,
    timeToLive: '5 minutes',
    lookup    : (key: string) => {
      const root = roots.get(key);

      if (root) {
        return E.succeed(root);
      }

      throw new Error();
    },
  });

  const lookup = (id: string, root_id: string, hash: FiberHash.T) =>
    pipe(
      cache.get(TreeRoot.makeKey(id, root_id)),
      E.map((tree) => {
        if (FiberHash.isEqual(hash, tree.hash)) {
          return tree;
        }
        roots.delete(TreeRoot.makeKey(id, root_id));
        return null;
      }),
      E.catchAll(() => E.succeed(null)),
    );

  const commit = (root: TreeRoot.T) => {
    roots.set(
      TreeRoot.makeKey(root.id, root.root_id),
      TreeRoot.updateHash(root),
    );
  };

  return {
    lookup,
    commit,
  };
});



export class RootMemory extends E.Tag('DisReact.RootMemory')<
  RootMemory,
  E.Effect.Success<typeof make>
>() {
  static readonly Live = L.effect(this, make);
}
