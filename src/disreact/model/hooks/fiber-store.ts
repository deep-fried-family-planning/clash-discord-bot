import type * as Ix from '#src/disreact/codec/wire/dapi.ts';
import {FiberNode} from '#src/disreact/model/fiber/fiber-node.ts';
import type {FiberHydrant} from '#src/disreact/model/fiber/fiber-hydrant.ts';
import type {Root} from '#src/disreact/model/root.ts';
import {Record} from 'effect';



export interface FiberStore {
  id    : FiberHydrant.Id;
  props : FiberHydrant.Props;
  fibers: {[id: FiberHydrant.FiberId]: FiberNode};
  next: {
    id   : FiberHydrant.Id;
    props: FiberHydrant.Props;
  };
  request?: Ix.Input;
  element?: Root;
};

export namespace FiberStore {
  export type T = FiberStore;

  export const make = (id: string, props?:FiberHydrant.Props): FiberStore => {
    return {
      id,
      props : props ?? {},
      fibers: {},
      next  : {
        id,
        props: {},
      },
    };
  };

  export const decode = (id: string, hash: FiberHydrant): FiberStore => {
    const {props, ...rest} = hash;

    return {
      id,
      props,
      fibers: Record.map(rest, (stack, id) => FiberNode.decode(id, stack)),
      next  : {
        id,
        props: null,
      },
    };
  };

  export const encode = (self: FiberStore): FiberHydrant => {
    return {
      props: self.props,
      ...Record.map(self.fibers, (node) => FiberNode.encode(node)),
    };
  };

  export const encircle = (self: FiberStore, element: Root, request: Ix.Input): FiberStore => {
    self.element = element;
    self.request = request;
    return self;
  };

  export const linearize = (self: FiberStore): FiberStore => {
    delete self.element;
    delete self.request;
    return self;
  };
}

export namespace $FiberStore {
  const STORE        = {current: null as FiberStore | null};
  export const get   = () => STORE.current!;
  export const set   = (fiber: FiberStore) => {STORE.current = fiber};
  export const clear = () => {STORE.current = null};
}
