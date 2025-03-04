import {EMPTY} from '#src/disreact/codec/constants/common.ts';
import type * as Element from '#src/disreact/codec/element/index.ts';
import * as FiberHash from '#src/disreact/codec/fiber/fiber-hash.ts';
import * as FiberPointer from '#src/disreact/codec/fiber/fiber-pointer.ts';
import * as FiberRoot from '#src/disreact/codec/fiber/fiber-root.ts';
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

export const synthesizeFromStatic = (root: StaticRoot.T, props?: any): T => {
  const fiber = FiberRoot.make();
  fiber.props = props;

  return {
    id     : EMPTY,
    root_id: root.root_id,
    pointer: FiberPointer.Null,
    fiber  : fiber,
    hash   : FiberHash.Empty,
    element: linkNodeToParent(
      FunctionElement.make(
        root.component,
        props,
      ),
    ),
  };
};

export const hydrateFromStatic = (id: string, root: StaticRoot.T, hash: FiberHash.T): T => {
  const fiber = FiberHash.decode(hash);

  return {
    id     : id,
    root_id: root.root_id,
    pointer: FiberPointer.make(id),
    fiber  : fiber,
    hash   : hash,
    element: linkNodeToParent(
      FunctionElement.make(
        root.component,
        fiber.props,
      ),
    ),
  };
};

export const makeFromStatic = (id: string, root: StaticRoot.T, props?: any): T => {
  const fiber = FiberRoot.make();
  fiber.props = props;

  return {
    id,
    root_id: root.root_id,
    pointer: FiberPointer.make(id),
    fiber  : fiber,
    hash   : FiberHash.Empty,
    element: linkNodeToParent(
      FunctionElement.make(
        root.component,
        props,
      ),
    ),
  };
};

export const finalize = (self: T) => {
  self.hash = FiberHash.hash(self.fiber);

  return self;
};

export const toKey = (self: T) => `${self.id}/${self.root_id}/${self.hash}`;
