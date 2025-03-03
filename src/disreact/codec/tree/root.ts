import type * as Element from '#src/disreact/codec/dsx/index.ts';
import * as FiberHash from '#src/disreact/codec/fiber/fiber-hash.ts';
import * as Pointer from '#src/disreact/codec/fiber/fiber-pointer.ts';
import type * as FiberRoot from '#src/disreact/codec/fiber/fiber-root.ts';



export type T = {
  pointer: Pointer.T;
  element: Element.T;
  fiber  : FiberRoot.T;
  hash   : FiberHash.T;
};

export const makeKey = (id: string, root_id: string) => `${id}/${root_id}`;

export const make = (id: string, root_id: string, element: Element.T, hash?: FiberHash.T): T => {
  return {
    pointer: Pointer.make(id, root_id),
    element,
    fiber  : FiberHash.derive(hash),
    hash   : hash ?? FiberHash.make(),
  };
};

export const updateHash = (tree: T) => {
  tree.hash = FiberHash.hash(tree.fiber);

  return tree;
};
