import {poly} from '#disreact/adaptor/adaptor/global.ts';
import type * as Traversable from '#disreact/core/Traversable.ts';
import type * as Element from '#disreact/model/entity/Element.ts';
import type * as Fn from '#disreact/model/entity/Fn.ts';
import * as Inspectable from 'effect/Inspectable';
import type * as Pipeable from 'effect/Pipeable';

export type Bundle = Record<string, Encoded[]>;

export interface Polymer extends Inspectable.Inspectable,
  Pipeable.Pipeable,
  Traversable.Origin<Element.Component>
{
  id   : string;
  pc   : number;
  rc   : number;
  stack: Monomer[];
  queue: Effector[];
  flags: Set<any>;
}

const PolymerProto: Polymer = {
  pc   : 0,
  rc   : 0,
  stack: undefined as any,
  queue: undefined as any,
  flags: undefined as any,
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id  : 'Polymer',
      pc   : this.pc,
      rc   : this.rc,
      stack: this.stack,
      queue: this.queue,
    });
  },
} as Polymer;

const make = (origin: Element.Component): Polymer => {
  const self = Object.create(PolymerProto) as Polymer;
  self.origin = origin;
  self.stack = [];
  self.queue = [];
  self.flags = origin._env.flags;
  return self;
};

export const mount = (origin: Element.Component, encoded?: Encoded[]): Polymer => {
  if (!encoded) {
    return make(origin);
  }
  return make(origin);
};

export const moun = (comp: Element.Component, bundle: Bundle) => {
  if (!bundle) {
    return make(comp);
  }
  const encoded = bundle[comp.trie];
  if (!encoded) {
    return make(comp);
  }
  return make(comp);
};

export const isStateless = (self: Polymer) => self.stack.length === 0;

export const isChanged = (self: Polymer) => {
  for (let i = 0; i < self.stack.length; i++) {
    const monomer = self.stack[i];

    if (monomer._tag === REDUCER) {
      if (monomer.changed) {
        return true;
      }
    }
  }
  return false;
};

export const isQueued = (self: Polymer) => self.queue.length === 0;

export const enqueue = (self: Polymer, monomer: Effector) => self.queue.push(monomer);

export const dequeue = (self: Polymer) => self.queue.shift()?.dispatch;

export const commit = (self: Polymer): Polymer => {
  if (!self.stack.length) {
    self.origin!.component._state = false;
    return self;
  }
  for (let i = 0; i < self.stack.length; i++) {
    const monomer = self.stack[i];

    if (monomer._tag === REDUCER) {
      monomer.changed = false;
    }
  }
  self.pc = 0;
  self.rc++;
  return self;
};

export const dehydrate = (self: Polymer): Encoded[] => {
  const encoded = [] as Encoded[];

  for (let i = 0; i < self.stack.length; i++) {
    const monomer = self.stack[i];

    encoded.push(poly.dehydrateMonomer(monomer));
  }
  return encoded;
};

export const unmount = (self?: Polymer) => {
  if (!self) {
    return self;
  }
  if (self.queue.length) {
    throw new Error('ope');
  }
  self.origin = undefined;
  (self.stack as any) = undefined;
  (self.queue as any) = undefined;
  (self.flags as any) = undefined;
  return undefined;
};

export interface Hook<M extends Monomer> {
  hydrate: boolean;
  monomer: M;
  flags  : Set<Element.Component>;
  element: Element.Component;
  queue  : Effector[];
}

export const assert = (self?: Polymer) => {
  if (!self) {
    throw new Error('Hooks must be called in a function component rendered by Disreact.');
  }
  return self;
};

export const hook = <A extends Monomer>(
  self: Polymer,
  tag: A['_tag'],
  lazy: () => A,
): A => {
  const monomer = self.stack[self.pc];

  if (!monomer) {
    const next = lazy();
    self.stack.push(next);
    self.pc++;
    return next;
  }
  if (monomer._tag === tag) {
    return monomer as A;
  }
  throw new Error('Hooks must be called in the same order as they are defined.');
};

export type Monomer =
  | None
  | Reducer
  | Effector
  | Reference
  | Memo
  | Contextual;

export const
  NONE     = 1,
  REDUCER  = 2,
  EFFECTOR = 3,
  REF      = 3,
  MEMO     = 4,
  CONTEXT  = 5;

const MonomerProto: Monomer = {
  _tag   : NONE as any,
  hydrate: false,
  ...Inspectable.BaseProto,
  toJSON() {
    switch (this._tag) {
      case NONE: {
        return {
          _id : 'Monomer',
          _tag: this._tag,
        };
      }
      case REDUCER: {
        return {
          _id     : 'Monomer',
          _tag    : this._tag,
          hydrate : this.hydrate,
          changed : this.changed,
          state   : this.state,
          dispatch: this.dispatch,
        };
      }
      case EFFECTOR: {
        return {
          _id    : 'Monomer',
          _tag   : this._tag,
          hydrate: this.hydrate,
        };
      }
      case REF: {
        return {
          _id    : 'Monomer',
          _tag   : this._tag,
          hydrate: this.hydrate,
          current: this.current,
        };
      }
      case MEMO: {
        return {
          _id    : 'Monomer',
          _tag   : this._tag,
          hydrate: this.hydrate,
          state  : this.state,
          deps   : this.deps,
        };
      }
      case CONTEXT: {
        return {
          _id    : 'Monomer',
          _tag   : this._tag,
          hydrate: this.hydrate,
        };
      }
    }
  },
} as Monomer;

export interface None extends Inspectable.Inspectable {
  _tag   : typeof NONE;
  hydrate: boolean;
}

export interface Reducer extends Inspectable.Inspectable {
  _tag    : typeof REDUCER;
  hydrate : boolean;
  changed : boolean;
  state   : any;
  dispatch: (action: any) => void;
}

export interface Effector extends Inspectable.Inspectable {
  _tag    : typeof EFFECTOR;
  hydrate : boolean;
  dispatch: Fn.Effector;
  deps    : any[] | undefined;
}

export interface Reference extends Inspectable.Inspectable {
  _tag   : typeof REF;
  hydrate: boolean;
  current: any;
}

export interface Memo extends Inspectable.Inspectable {
  _tag   : typeof MEMO;
  hydrate: boolean;
  state  : any;
  deps   : any[] | undefined;
}

export interface Contextual extends Inspectable.Inspectable {
  _tag   : typeof CONTEXT;
  hydrate: boolean;
}

const NoneProto: None = Object.assign(Object.create(MonomerProto), {
  _tag: NONE,
});

export const none = () => NoneProto;

const ReducerProto: None = Object.assign(Object.create(MonomerProto), {
  _tag: REDUCER,
});

export const reducer = (state: any) => {
  const self = Object.create(ReducerProto) as Reducer;
  self.state = state;
  return self;
};

const EffectProto: Effector = Object.assign(Object.create(MonomerProto), {
  _tag: EFFECTOR,
});

export const effector = (dispatch: any, deps?: any[]) => {
  const self = Object.create(EffectProto) as Effector;
  self.dispatch = dispatch;
  self.deps = deps;
  return self;
};

const ReferenceProto: Reference = Object.assign(Object.create(MonomerProto), {
  _tag: REF,
});

export const reference = (current: any) => {
  const self = Object.create(ReferenceProto) as Reference;
  self.current = current;
  return self;
};

const MemoProto: Memo = Object.assign(Object.create(MonomerProto), {
  _tag: MEMO,
});

export const memoize = (state: any, deps?: any[]) => {
  const self = Object.create(MemoProto) as Memo;
  self.state = state;
  self.deps = deps;
  return self;
};

const ContextProto: Contextual = Object.assign(Object.create(MonomerProto), {
  _tag: CONTEXT,
});

export const contextual = () => ContextProto;

export type Encoded =
  | typeof NONE
  | [typeof REDUCER, any]
  | typeof EFFECTOR
  | [typeof EFFECTOR, any[]]
  | typeof REF
  | [typeof REF, any]
  | typeof MEMO
  | [typeof MEMO, any[]]
  | [typeof CONTEXT];
