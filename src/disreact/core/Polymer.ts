import type * as Lateral from '#disreact/core/behaviors/lateral.ts';
import type * as Lineage from '#disreact/core/behaviors/lineage.ts';
import type * as Document from '#disreact/core/Document.ts';
import type {MONOMER_CONTEXTUAL, MONOMER_EFFECT, MONOMER_MEMO, MONOMER_NONE, MONOMER_REDUCER, MONOMER_REF} from '#disreact/core/immutable/constants.ts';
import {MONOMER_STATE, type MonomerTag} from '#disreact/core/immutable/constants.ts';
import * as internal from '#disreact/core/internal/polymer.ts';
import type * as Node from '#disreact/core/Element.ts';
import type * as E from 'effect/Effect';
import type * as Inspectable from 'effect/Inspectable';
import type * as Pipeable from 'effect/Pipeable';

export type Monomer =
  | None
  | Stateful
  | Reducer
  | Effectful
  | Reference
  | Memoize
  | Contextual;

export interface BaseMonomer extends Inspectable.Inspectable {
  _tag    : MonomerTag;
  hydrate?: boolean;
  changed?: boolean;
  state?  : any;
  deps?   : any[] | undefined;
  fn?     : EffectFn;
  fx?     : Effect;
  current?: any;
  value?  : any;
}

export interface None extends BaseMonomer {
  _tag: typeof MONOMER_NONE;
}

export interface Stateful extends BaseMonomer {
  _tag   : typeof MONOMER_STATE;
  changed: boolean;
  state  : any;
  updater(next: any): void;
}

export interface Reducer extends BaseMonomer {
  _tag   : typeof MONOMER_REDUCER;
  changed: boolean;
  state  : any;
  reducer(state: any, action: any): any;
}

export interface Effectful extends BaseMonomer {
  _tag: typeof MONOMER_EFFECT;
  deps: any[] | undefined;
  fn?(): EffectOutput;
  fx? : Effect;
}

export interface Reference extends BaseMonomer {
  _tag   : typeof MONOMER_REF;
  current: any;
}

export interface Memoize extends BaseMonomer {
  _tag : typeof MONOMER_MEMO;
  value: any;
  deps : any[] | undefined;
}

export interface Contextual extends BaseMonomer {
  _tag: typeof MONOMER_CONTEXTUAL;
}

export type Encoded =
  | typeof MONOMER_NONE
  | [typeof MONOMER_STATE, any]
  | [typeof MONOMER_REDUCER, any]
  | typeof MONOMER_EFFECT
  | [typeof MONOMER_EFFECT, any[]]
  | typeof MONOMER_REF
  | [typeof MONOMER_REF, any]
  | typeof MONOMER_MEMO
  | [typeof MONOMER_MEMO, any[]]
  | [typeof MONOMER_CONTEXTUAL];

export type EffectOutput = | void
                           | Promise<void>
                           | E.Effect<void>;

export interface EffectFn {
  (): EffectOutput;
}

export type Effect = | EffectFn
                     | E.Effect<void>;

export interface Polymer extends Pipeable.Pipeable, Inspectable.Inspectable {
  document: Document.Document;
  node    : Node.Func;
  pc      : number;
  rc      : number;
  stack   : Monomer[];
  queue   : Effectful[];
}

export const empty = (node: Node.Func, document: Document.Document): Polymer => internal.empty(node, document);

export const isStateless = internal.isStateless;

export const hasEffects = internal.hasEffects;

export const isChanged = (self: Polymer) => {
  for (let i = 0; i < self.stack.length; i++) {
    if (internal.isChanged(self.stack[i])) {
      return true;
    }
  }
  return false;
};

export const hydrate = (node: Node.Func, document: Document.Document, stack?: Encoded[]): Polymer => {
  const self = empty(node, document);
  if (!stack) {
    return self;
  }
  for (let i = 0; i < stack.length; i++) {
    self.stack.push(internal.hydrateMonomer(stack[i]));
  }
  return self;
};

export const commit = (self: Polymer): Polymer => {
  for (let i = 0; i < self.stack.length; i++) {
    if (self.stack[i]._tag === MONOMER_STATE) {
      self.stack[i].changed = false;
    }
  }
  return self;
};

export const dehydrate = (self: Polymer): Encoded[] => {
  const encoded = [] as Encoded[];
  for (let i = 0; i < self.stack.length; i++) {
    const monomer = self.stack[i];
    encoded.push(internal.dehydrateMonomer(monomer));
  }
  return encoded;
};

export const dispose = (self: Polymer) => {
  if (self.queue.length) {
    throw new Error();
  }
  (self.document as any) = undefined;
  (self.node as any) = undefined;
  (self.stack as any) = undefined;
  (self.queue as any) = undefined;
  return undefined;
};

export const dequeue = internal.dequeue;
