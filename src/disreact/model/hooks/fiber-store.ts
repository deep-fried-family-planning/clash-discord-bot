import type * as Ix from '#src/disreact/codec/wire/dapi.ts';
import type {Hydrant} from '#src/disreact/model/hooks/fiber-hydrant.ts';
import {FiberNode} from '#src/disreact/model/hooks/fiber-node.ts';
import type {Root} from '#src/disreact/model/root.ts';
import {Record} from 'effect';



export * as FiberStore from './fiber-store.ts';

export type FiberStore = {
  id    : Hydrant.Id;
  props : Hydrant.Props;
  fibers: {[id: Hydrant.FiberId]: FiberNode};
  next: {
    id   : Hydrant.Id;
    props: Hydrant.Props;
  };
  request?: Ix.Input;
  element?: Root;
};

export type T = FiberStore;

export const make = (id: string, props?: Hydrant.Props): FiberStore => {
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

export const decode = (id: string, hash: Hydrant): FiberStore => {
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

export const encode = (self: FiberStore): Hydrant => {
  return {
    props: self.props,
    ...Record.map(self.fibers, (node) => FiberNode.encode(node)),
  };
};

export const clone = (self: FiberStore): FiberStore => {
  const {element, fibers, ...rest} = self;

  const cloned = structuredClone(rest) as FiberStore;
  cloned.fibers = Record.map(fibers, (node) => FiberNode.clone(node));
  return cloned;
};

export const linearize = (self: FiberStore): FiberStore => {
  delete self.element;
  delete self.request;
  return self;
};

export const circularize = (self: FiberStore, element: Root, request: Ix.Input): FiberStore => {
  self.element = element;
  self.request = request;
  return self;
};



export namespace λ_λ {
  const STORE        = {current: null as FiberStore | null};
  export const get   = () => STORE.current!;
  export const set   = (fiber: FiberStore) => {STORE.current = fiber};
  export const clear = () => {STORE.current = null};
}
