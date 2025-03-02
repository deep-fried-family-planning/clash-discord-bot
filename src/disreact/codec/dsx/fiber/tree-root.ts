import {_Tag} from '#src/disreact/codec/common/index.ts';
import * as Element from '#src/disreact/codec/dsx/element/index.ts';
import {FiberHash, FiberRoot} from '#src/disreact/codec/dsx/fiber/index.ts';
import {S} from '#src/internal/pure/effect.ts';



export const T = S.Struct({
  _tag   : S.tag(_Tag.TREE_ROOT),
  key    : S.String,
  id     : S.String,
  root_id: S.String,
  element: Element.T,
  fiber  : S.mutable(FiberRoot.T),
  hash   : S.mutable(FiberHash.Encoded),
}).pipe(S.mutable);

const t = S.mutable(T);

export type T = S.Schema.Type<typeof t> & {
  fiber: FiberRoot.T;
};

export const is = (tree: any): tree is T => tree._tag === _Tag.TREE_ROOT;

export const makeKey = (id: string, root_id: string) => `${id}/${root_id}`;

export const make = (id: string, root_id: string, element: Element.T, hash?: FiberHash.Encoded): T => {
  return {
    _tag : _Tag.TREE_ROOT,
    key  : makeKey(id, root_id),
    id,
    root_id,
    element,
    fiber: FiberRoot.hydrate(hash),
    hash : hash ?? FiberHash.empty,
  };
};

export const commit = (tree: T) => {
  tree.hash = FiberHash.hashFiberRoot(tree.fiber);
  return tree;
};
