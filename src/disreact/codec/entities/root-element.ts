import {linkNodeToParent} from '#src/disreact/model/lifecycles/index.ts';
import * as FunctionElement from 'src/disreact/codec/element/function-element.ts';
import type * as Element from 'src/disreact/codec/element/index.ts';
import * as FiberHash from 'src/disreact/codec/entities/fiber-hash.ts';
import * as FiberPointer from 'src/disreact/codec/entities/fiber-pointer.ts';
import type * as FiberRoot from 'src/disreact/codec/entities/fiber-root.ts';
import type * as StaticRoot from './static-root.ts';



export type RootElement = {
  id     : string;
  root_id: string;
  pointer: FiberPointer.Type;
  fiber  : FiberRoot.FiberRoot;
  hash   : FiberHash.FiberHash;
  element: Element.Element;
};

export const cloneStatic = (id: string, root: StaticRoot.StaticRoot, props?: any, hash?: FiberHash.FiberHash): RootElement => {
  return {
    id     : id,
    root_id: root.root_id,
    pointer: FiberPointer.make(id),
    fiber  : FiberHash.decode(hash),
    hash   : hash ?? FiberHash.Empty,
    element: linkNodeToParent(FunctionElement.make(root.component, props)),
  };
};

export const finalize = (self: RootElement) => {
  self.hash = FiberHash.hash(self.fiber);
  return self;
};
