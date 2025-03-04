import type * as Element from '#src/disreact/codec/element/index.ts';
import * as FiberHash from '#src/disreact/codec/fiber/fiber-hash.ts';
import * as FiberPointer from '#src/disreact/codec/fiber/fiber-pointer.ts';
import type * as FiberRoot from '#src/disreact/codec/fiber/fiber-root.ts';
import type * as StaticRoot from '#src/disreact/codec/fiber/static-root.ts';
import {linkNodeToParent} from '#src/disreact/model/lifecycles/index.ts';
import * as FunctionElement from 'src/disreact/codec/element/function-element.ts';



export type T = {
  id     : string;
  root_id: string;
  pointer: FiberPointer.T;
  fiber  : FiberRoot.T;
  hash   : FiberHash.T;
  element: Element.T;
};

export const cloneFromStaticRoot = (id: string, root: StaticRoot.T, props?: any, hash?: FiberHash.T): T => {
  return {
    id     : id,
    root_id: root.root_id,
    pointer: FiberPointer.make(id),
    fiber  : FiberHash.decode(hash),
    hash   : hash ?? FiberHash.Empty,
    element: linkNodeToParent(FunctionElement.make(root.component, props)),
  };
};

export const finalize = (self: T) => {
  self.hash = FiberHash.hash(self.fiber);
  return self;
};
