/* eslint-disable no-case-declarations */
import type * as Traversable from '#disreact/core/Traversable.ts';
import type * as Element from '#disreact/model/Element.ts';
import type * as Fn from '#disreact/model/Fn.ts';
import type {Effector} from '#disreact/model/Fn.ts';
import {dual} from 'effect/Function';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';

type MTag = Monomer['_tag'];
type Mono<T extends MTag = MTag> = Extract<Monomer, {_tag: T}>;

type HookFn = (...args: any) => any;

export interface Polymer<
  T extends MTag = MTag,
  I = any,
  O = any,
> extends Inspectable.Inspectable,
  Pipeable.Pipeable,
  Traversable.Origin<Element.Component>,
  Traversable.Ancestor<Polymer>,
  Traversable.Descendent<Polymer>
{
  id    : string;
  pc    : number;
  rc    : number;
  stack : Monomer[];
  queue : Updater[];
  flags : Set<any>;
  inputs: any[];
  assert: T;
  lazy(this: ThisType<Polymer>): Mono<T>;
  output: O;
}

export const isStateless = (self: Polymer) => self.stack.length === 0;

export const isQueued = (self: Polymer) => self.queue.length === 0;

export const isChanged = (self: Polymer) => {
  return false;
};

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
    return {
      _id  : 'Polymer',
      pc   : this.pc,
      rc   : this.rc,
      stack: this.stack,
      queue: this.queue,
    };
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

export const mount = (origin: Element.Component): Polymer => {
  return make(origin);
};

export const dispose = (self?: Polymer) => {
  if (!self) {
    return self;
  }
  if (self.queue.length) {
    throw new Error('ope');
  }
  self.ancestor = undefined;
  self.origin = undefined;
  self.children = undefined;
  (self.stack as any) = undefined;
  (self.queue as any) = undefined;
  (self.flags as any) = undefined;
  return undefined;
};

export const commit = (self: Polymer): Polymer => {
  if (!self.stack.length) {
    self.origin!.type._state = false;
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

export interface H {

}

export const enqueue = (self: Polymer, monomer: Effector) => self.queue.push(monomer);

export const dequeue = (self: Polymer) => self.queue.shift()?.dispatch;

export const acquire = dual<
  <T extends MTag>(tag: T) => (self: Polymer<MTag>) => Polymer<T>,
  <T extends MTag>(self: Polymer<MTag>, tag: T) => Polymer<T>
>(2, (self, tag) => {
  self.assert = tag;
  return self as unknown as Polymer<typeof tag>;
});

export const lazy = dual<
  <T extends MTag>(lazy: (p: Polymer) => Mono<T>) => (self: Polymer<T>) => Polymer<T>,
  <T extends MTag>(self: Polymer, lazy: (p: Polymer) => Mono<T>) => Polymer<T>
>(2, (self, lazy) => {
  self.lazy = lazy;
  return self;
});

export interface Hook<T extends MTag> {
  hydrate: boolean;
  monomer: Mono<T>;
  flags  : Set<Element.Component>;
  element: Element.Component;
  queue  : Effector[];
}

export const define = dual<
  <T extends MTag, O>(impl: (hook: Hook<T>) => O) => (self: Polymer<T>) => Polymer<T>,
  <T extends MTag, O>(self: Polymer<T>, impl: (arg: Hook<T>) => O) => Polymer<T>
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

export const release = <T extends MTag, M extends Mono<T>, O>(self: Polymer<T, M, O>): O => {
  const output = self.output;
  (self.output as any) = undefined;
  (self.lazy as any) = undefined;
  (self.assert as any) = undefined;
  return output;
};

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

export type Monomer =
  | Monomer.State
  | Monomer.Effect
  | Monomer.Ref
  | Monomer.Memo
  | Monomer.Context;

export namespace Monomer {
  export type Tag =
    | typeof STATE
    | typeof EFFECT
    | typeof REF
    | typeof MEMO
    | typeof CONTEXT;

  export type Type<T extends Tag> = Extract<Monomer, {_tag: T}>;

  export interface State extends Inspectable.Inspectable {
    _tag    : typeof STATE;
    state   : any;
    init    : () => any;
    update  : (next: any) => void;
    changed : boolean;
    queued  : boolean;
    encoded?: | [typeof STATE, any];
  }
  export interface Effect extends Inspectable.Inspectable {
    _tag    : typeof EFFECT;
    update  : Fn.Effector;
    deps    : any[] | undefined;
    queued  : boolean;
    encoded?: | typeof EFFECT
              | [typeof EFFECT, any[]];
  }
  export interface Ref extends Inspectable.Inspectable {
    _tag    : typeof REF;
    state   : any;
    encoded?: | typeof REF
              | [typeof REF, any];
  }
  export interface Memo extends Inspectable.Inspectable {
    _tag    : typeof MEMO;
    deps    : any[] | undefined;
    encoded?: | typeof MEMO
              | [typeof MEMO, any[]];
  }
  export interface Context extends Inspectable.Inspectable {
    _tag    : typeof CONTEXT;
    encoded?: | typeof CONTEXT;
  }
  export type Encoded =
    | Required<State>['encoded']
    | Required<Effect>['encoded']
    | Required<Ref>['encoded']
    | Required<Memo>['encoded']
    | Required<Context>['encoded'];
}

const MonomerProto: Monomer = {
  _tag   : STATE as any,
  state  : undefined as any,
  deps   : undefined as any,
  init   : undefined as any,
  update : undefined as any,
  changed: false,
  queued : false,
  encoded: undefined as any,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    switch (this._tag) {
      case STATE:
        return {
          _id  : 'Monomer',
          _tag : 'State',
          state: this.state,
        };
      case EFFECT:
        return {
          _id : 'Monomer',
          _tag: 'Effect',
          deps: this.deps,
        };
      case REF:
        return {
          _id    : 'Monomer',
          _tag   : 'Ref',
          current: this.state,
        };
      case MEMO:
        return {
          _id : 'Monomer',
          _tag: 'Memo',
          deps: this.deps,
        };
      case CONTEXT:
        return {
          _id : 'Monomer',
          _tag: 'Context',
          _tag: this._tag,
        };
    }
  },
};

const ReducerProto: Monomer.State = Object.assign(Object.create(MonomerProto), {
  _tag: STATE,
});

const EffectProto: Monomer.Effect = Object.assign(Object.create(MonomerProto), {
  _tag: EFFECT,
});

const RefProto: Monomer.Ref = Object.assign(Object.create(MonomerProto), {
  _tag: REF,
});

const MemoProto: Monomer.Memo = Object.assign(Object.create(MonomerProto), {
  _tag: MEMO,
});

const ContextProto: Monomer.Context = Object.assign(Object.create(MonomerProto), {
  _tag: CONTEXT,
});

const dehydrateMono = (monomer: Monomer): Monomer.Encoded => {
  switch (monomer._tag) {
    case STATE:
      return [STATE, monomer.state];

    case EFFECT:
      if (!monomer.deps) {
        return EFFECT;
      }
      return [EFFECT, monomer.deps];

    case REF:
      if (typeof monomer.state === 'function') {
        return REF;
      }
      return [REF, monomer.state];

    case MEMO:
      if (!monomer.deps) {
        return MEMO;
      }
      return [MEMO, monomer.deps];

    case CONTEXT:
      return CONTEXT;
  }
};

const hydrateMono = (encoded: Monomer.Encoded): Monomer => {
  if (Array.isArray(encoded)) {
    switch (encoded[0]) {
      case STATE:
        const state = Object.create(ReducerProto) as Monomer.State;
        state.encoded = encoded;
        state.state = encoded[1];
        return state;

      case EFFECT:
        const effect = Object.create(EffectProto) as Monomer.Effect;
        effect.encoded = encoded;
        effect.deps = encoded[1];
        return effect;

      case REF:
        const ref = Object.create(RefProto) as Monomer.Ref;
        ref.encoded = encoded;
        ref.state = encoded[1];
        return ref;

      case MEMO:
        const memo = Object.create(MemoProto) as Monomer.Memo;
        memo.encoded = encoded;
        memo.deps = encoded[1];
        return memo;
    }
  }
  switch (encoded) {
    case EFFECT:
      const effect = Object.create(EffectProto) as Monomer.Effect;
      effect.encoded = encoded;
      return effect;

    case REF:
      const ref = Object.create(RefProto) as Monomer.Ref;
      ref.encoded = encoded;
      return ref;

    case MEMO:
      const memo = Object.create(MemoProto) as Monomer.Memo;
      memo.encoded = encoded;
      return memo;

    case CONTEXT:
      const context = Object.create(ContextProto) as Monomer.Context;
      context.encoded = encoded;
      return context;
  }
};

export type Updater =
  | Updater.StateUpdater
  | Updater.EffectUpdater;

export namespace Updater {
  export type StateUpdater = {
    _tag   : 'State';
    monomer: Monomer.State;
    action(): void;
  };
  export type EffectUpdater = {
    _tag   : 'Effect';
    monomer: Monomer.Effect;
  };
}

const UpdaterProto: Updater = {
  _tag   : undefined as any,
  monomer: undefined as any,
  action : undefined as any,
};

const StateUpdaterProto: Updater.StateUpdater = Object.assign(Object.create(UpdaterProto), {
  _tag: 'State',
});

const EffectUpdaterProto: Updater.EffectUpdater = Object.assign(Object.create(UpdaterProto), {
  _tag: 'Effect',
});

export const updater = (
  monomer: | Monomer.State
           | Monomer.Effect,
) => {
  switch (monomer._tag) {
    case STATE:
      const state = Object.create(StateUpdaterProto) as Updater.StateUpdater;
      state.monomer = monomer;
      return state;
    case EFFECT:
      const effect = Object.create(EffectUpdaterProto) as Updater.EffectUpdater;
      effect.monomer = monomer;
      return effect;
  }
};
