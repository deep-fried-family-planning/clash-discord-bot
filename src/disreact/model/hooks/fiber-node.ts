import {ONE, ZERO} from '#src/disreact/codec/constants/common.ts';
import type {TaskElem} from '#src/disreact/model/entity/element-task.ts';
import type {Hydrant} from '#src/disreact/model/hooks/fiber-hydrant.ts';
import type {FiberStore} from '#src/disreact/model/hooks/fiber-store.ts';
import * as Data from 'effect/Data';
import * as Equal from 'effect/Equal';



export * as FiberNode from './fiber-node.ts';

export type FiberNode = {
  id      : string;
  pc      : number;
  rc      : number;
  stack   : Hydrant.Stack;
  saved   : Hydrant.Stack;
  queue   : any[];
  element?: TaskElem;
  root?   : FiberStore;
};

export const make = (id: string): FiberNode => {
  return {
    id,
    rc   : ZERO,
    pc   : ZERO,
    stack: [],
    saved: [],
    queue: [],
  };
};

export const decode = (id: string, stack: Hydrant.Stack): FiberNode => {
  return {
    id,
    rc   : ONE,
    pc   : ZERO,
    stack,
    saved: [],
    queue: [],
  };
};

export const encode = (self: FiberNode): Hydrant.Stack => self.stack;

export const clone = (self: FiberNode): FiberNode => {
  if (self.queue.length > 0) {
    throw new Error('Queue is not empty.');
  }

  const {element, root, ...rest} = self;

  return structuredClone(rest);
};

export const commit = (self: FiberNode) => {
  self.saved = structuredClone(self.stack);
  self.pc    = ZERO;
  return self;
};

export const isFirstRender = (self: FiberNode) => self.rc === ZERO;

export const isSame = (self: FiberNode) => {
  const a = self.stack;
  const b = self.saved;

  if (a.length !== b.length) {
    return false;
  }

  const stackData = Data.array(self.stack.map((s) => s === null ? null : Data.struct(s)));
  const priorData = Data.array(self.saved.map((s) => s === null ? null : Data.struct(s)));

  return Equal.equals(stackData, priorData);
};



export namespace λ_λ {
  const STORE        = {current: null as FiberNode | null};
  export const get   = () => STORE.current!;
  export const set   = (fiber: FiberNode) => {STORE.current = fiber};
  export const clear = () => {STORE.current = null};
}
