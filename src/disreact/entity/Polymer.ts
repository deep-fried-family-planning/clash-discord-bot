import {poly} from '#disreact/adaptor/adaptor/global.ts';
import type * as Traversable from '#disreact/core/Traversable.ts';
import type * as Element from '#disreact/entity/Element.ts';
import type * as Fn from '#disreact/entity/Fn.ts';
import {dual} from 'effect/Function';
import * as Inspectable from 'effect/Inspectable';
import type * as Pipeable from 'effect/Pipeable';

export type UpdaterSync = {
  _tag: 'Sync';
  run : () => void;
};

export type StateUpdater = {
  _tag: 'State';
  run : () => void;
};

export type EffectUpdater = {
  _tag: 'Effect';
  run : () => void;
};

export type Updater = {};

export type Bundle = Record<string, Encoded[]>;

type Tag = Monomer['_tag'];
type Mono<T extends Tag = Tag> = Extract<Monomer, {_tag: T}>;

type HookFn = (...args: any) => any;

export interface Polymer<
  T extends Tag = Tag,
  O = any,
> extends Inspectable.Inspectable,
  Pipeable.Pipeable,
  Traversable.Origin<Element.Component>
{
  id   : string;
  pc   : number;
  rc   : number;
  stack: Monomer[];
  queue: Effector[];
  flags: Set<any>;

  assert: T;
  lazy(this: ThisType<Polymer>): Mono<T>;
  output: O;
}

const PolymerProto: Polymer = {
  pc    : 0,
  rc    : 0,
  stack : undefined as any,
  queue : undefined as any,
  flags : undefined as any,
  assert: undefined as any,
  lazy  : undefined as any,
  output: undefined as any,
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

    if (monomer._tag === STATE) {
      if (monomer.changed) {
        return true;
      }
    }
  }
  return false;
};

export const dispose = (self?: Polymer) => {
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

    if (monomer._tag === STATE) {
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

export const kind = dual<
  <T extends Tag>(tag: T) => (self: Polymer<Tag>) => Polymer<T>,
  <T extends Tag>(self: Polymer<Tag>, tag: T) => Polymer<T>
>(2, (self, tag) => {
  self.assert = tag;
  return self as unknown as Polymer<typeof tag>;
});

export const lazy = dual<
  <T extends Tag>(lazy: (p: Polymer) => Mono<T>) => (self: Polymer<T>) => Polymer<T>,
  <T extends Tag>(self: Polymer<T>, lazy: (p: Polymer) => Mono<T>) => Polymer<T>
>(2, (self, lazy) => {
  self.lazy = lazy;
  return self;
});

export interface Hook<T extends Tag> {
  hydrate: boolean;
  monomer: Mono<T>;
  flags  : Set<Element.Component>;
  element: Element.Component;
  queue  : Effector[];
}

export const define = dual<
  <T extends Tag, O>(impl: (hook: Hook<T>) => O) => (self: Polymer<T>) => Polymer<T>,
  <T extends Tag, O>(self: Polymer<T>, impl: (arg: Hook<T>) => O) => Polymer<T>
>(2, (self, impl) => {
  const monomer = self.stack[self.pc];

  if (!monomer) {

  }
  if (monomer._tag !== self.assert) {
    throw new Error('Hooks must be called in the same order as they are defined.');
  }

  const hook = {
    hydrate: false,
    monomer: undefined as any,
    flags  : new Set(),
    element: undefined as any,
    queue  : [],
  };
});

export const release = <T extends Tag, M extends Mono<T>, O>(self: Polymer<T, M, O>): O => {
  const output = self.output;
  (self.output as any) = undefined;
  (self.lazy as any) = undefined;
  (self.assert as any) = undefined;
  return output;
};

const thing: Polymer;

const ope = () =>
  thing.pipe(
    kind(NONE),
    lazy(() => none()),
    define((hook) => {
      hook.flags;
    }),
  );

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

export const
  STATE   = 1 as const,
  EFFECT  = 2 as const,
  REF     = 3 as const,
  MEMO    = 4 as const,
  CONTEXT = 5 as const;

export namespace Monomer {
  export type StateEncoded = [typeof STATE, any];

  export interface State extends Inspectable.Inspectable {
    _tag    : typeof STATE;
    state   : any;
    init(): any;
    update(action: any): void;
    encoded?: StateEncoded;
  }

  export type EffectEncoded = | typeof EFFECT
                              | [typeof EFFECT, any[]];

  export interface Effect extends Inspectable.Inspectable {
    _tag    : typeof EFFECT;
    effect  : Fn.Effector;
    deps    : any[] | undefined;
    encoded?: EffectEncoded;
  }

  export type RefEncoded = | typeof REF
                           | [typeof REF, any];

  export interface Ref extends Inspectable.Inspectable {
    _tag    : typeof REF;
    current : any;
    encoded?: RefEncoded;
  }

  export type MemoEncoded = | typeof MEMO
                            | [typeof MEMO, any[]];

  export interface Memo extends Inspectable.Inspectable {
    _tag    : typeof MEMO;
    deps    : any[] | undefined;
    encoded?: MemoEncoded;
  }

  export type ContextEncoded = typeof CONTEXT;

  export interface Context extends Inspectable.Inspectable {
    _tag    : typeof CONTEXT;
    encoded?: ContextEncoded;
  }

  export type Encoded = | StateEncoded
                        | EffectEncoded
                        | RefEncoded
                        | MemoEncoded
                        | ContextEncoded;
}

export type Monomer = | Monomer.State
                      | Monomer.Effect
                      | Monomer.Ref
                      | Monomer.Memo
                      | Monomer.Context;

const MonomerProto: Monomer = {
  _tag   : STATE as any,
  hydrate: false,
} as Monomer;

const ReducerProto: Monomer.State = Object.assign(Object.create(MonomerProto), {
  _tag: STATE,
});

export const reducer = (state: any) => {
  const self = Object.create(ReducerProto) as Reducer;
  self.state = state;
  return self;
};

const EffectProto: Monomer.Effect = Object.assign(Object.create(MonomerProto), {
  _tag: EFFECT,
});

export const effector = (dispatch: any, deps?: any[]) => {
  const self = Object.create(EffectProto) as Effector;
  self.dispatch = dispatch;
  self.deps = deps;
  return self;
};

const ReferenceProto: Monomer.Ref = Object.assign(Object.create(MonomerProto), {
  _tag: REF,
});

export const reference = (current: any) => {
  const self = Object.create(ReferenceProto) as Reference;
  self.current = current;
  return self;
};

const MemoProto: Monomer.Memo = Object.assign(Object.create(MonomerProto), {
  _tag: MEMO,
});

export const memoize = (state: any, deps?: any[]) => {
  const self = Object.create(MemoProto) as Memo;
  self.state = state;
  self.deps = deps;
  return self;
};

const ContextProto: Monomer.Context = Object.assign(Object.create(MonomerProto), {
  _tag: CONTEXT,
});

export const contextual = () => ContextProto;



const dehydrateMono = (monomer: Monomer): Monomer.Encoded => {
  switch (monomer._tag) {
    case STATE: {
      return [STATE, monomer.state];
    }
    case EFFECT: {
      if (!monomer.deps) {
        return EFFECT;
      }
      return [EFFECT, monomer.deps];
    }
    case REF: {
      if (typeof monomer.current === 'function') {
        return REF;
      }
      return [REF, monomer.current];
    }
    case MEMO: {
      if (!monomer.deps) {
        return MEMO;
      }
      return [MEMO, monomer.deps];
    }
    case CONTEXT: {
      return CONTEXT;
    }
  }
};

const hydrateMono = (encoded: Monomer.Encoded): Monomer => {
  const self = Object.create(MonomerProto);

  if (!Array.isArray(encoded)) {
    switch (encoded) {
      case EFFECT: {
        self._tag = EFFECT;
        return self;
      }
      case REF: {
        return self;
      }
      case MEMO: {
        return self;
      }
      case CONTEXT: {
        return self;
      }
    }
  }
  switch (encoded[0]) {
    case STATE: {
      return reducer(encoded[1]);
    }
    case EFFECT: {
      return effector(encoded[1]);
    }
    case REF: {
      return reference(encoded[1]);
    }
  }
};
