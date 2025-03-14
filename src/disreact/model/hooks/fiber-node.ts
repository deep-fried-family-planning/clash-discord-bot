import {ONE, ZERO} from '#src/disreact/codec/constants/common.ts';
import type {TaskElement} from '#src/disreact/model/element/task-element.ts';
import type {FiberHydrant} from '#src/disreact/model/fiber/fiber-hydrant.ts';
import type {FiberStore} from '#src/disreact/model/fiber/fiber-store.ts';
import * as Data from 'effect/Data';
import * as Equal from 'effect/Equal';



export interface FiberNode {
  id      : string;
  pc      : number;
  rc      : number;
  stack   : FiberHydrant.Stack;
  saved   : FiberHydrant.Stack;
  queue   : any[];
  element?: TaskElement;
  root?   : FiberStore;
};

export namespace FiberNode {
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

  export const decode = (id: string, stack: FiberHydrant.Stack): FiberNode => {
    return {
      id,
      rc   : ONE,
      pc   : ZERO,
      stack,
      saved: [],
      queue: [],
    };
  };

  export const encode = (self: FiberNode): FiberHydrant.Stack => self.stack;

  export const clone = (self: FiberNode): FiberNode => {
    if (self.queue.length > 0) {
      throw new Error('Queue is not empty.');
    }

    linearize(self);

    return structuredClone(self);
  };

  export const encircle = (self: FiberNode, element: TaskElement, root: FiberStore): FiberNode => {
    self.element = element;
    self.root    = root;
    return self;
  };

  export const linearize = (self: FiberNode): FiberNode => {
    delete self.element;
    delete self.root;
    return self;
  };

  export const commit = (self: FiberNode): FiberNode => {
    self.saved = structuredClone(self.stack);
    self.rc    = ZERO;
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
}

export namespace $FiberNode {
  const STORE        = {current: null as FiberNode | null};
  const SIGNAL       = {current: false};
  export const get   = () => STORE.current!;
  export const set   = (fiber: FiberNode) => {STORE.current = fiber};
  export const clear = () => {STORE.current = null};
}
