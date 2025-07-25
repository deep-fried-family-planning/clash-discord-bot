/* eslint-disable no-case-declarations */
import type * as Traversable from '#disreact/model/core/Traversable.ts';
import type * as Element from '#disreact/model/entity/Element.ts';
import type * as Effect from 'effect/Effect';
import {dual} from 'effect/Function';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';
import * as PrimaryKey from 'effect/PrimaryKey';
import type * as Record from 'effect/Record';

type MTag = Monomer['_tag'];
type Mono<T extends MTag = MTag> = Extract<Monomer, {_tag: T}>;

export interface Hook {
  stage  : 'Init' | 'Hydrate' | 'Rerender' | 'Dispatch';
  phase  : 'Render' | 'Flush' | 'Inactive';
  pc     : number;
  stack  : Monomer[];
  effects: Monomer.Effect[];
  updates: (() => void)[];
  flag(): void;
}

export interface Polymer extends Inspectable.Inspectable,
  Pipeable.Pipeable,
  Traversable.Origin<Element.Element>,
  Hook
{
  type     : any;
  id       : string;
  pc       : number;
  rc       : number;
  stack    : Monomer[];
  fc?      : Element.FC;
  signature: Monomer.Signature;
  queue    : Updater[];
}

export const isStateless = (self: Polymer) =>
  self.stack.length === 0;

export const isPending = (self: Polymer) =>
  self.queue.length > 0;

export const isChanged = (self: Polymer) => {
  if (!self.stack.length) {
    return false;
  }
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

const PolymerProto: Polymer = {
  pc   : 0,
  rc   : 0,
  stack: undefined as any,
  queue: undefined as any,
  flag() {
    this.origin!.env.flags.add(this.origin!);
  },
  ...Pipeable.Prototype,
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

export const make = (elem: Element.Element): Polymer => {
  const self = Object.create(PolymerProto) as Polymer;
  self.id = PrimaryKey.value(elem);
  self.origin = elem;
  self.signature = [];
  self.stack = [];
  self.queue = [];
  return self;
};

export const dispose = (self: Polymer) => {
  if (self.queue.length) {
    throw new Error('ope');
  }
  (self.origin as any) = undefined;
  (self.stack as any) = undefined;
  (self.queue as any) = undefined;
  return undefined;
};

export const commit = (self: Polymer): Polymer => {
  self.phase = 'Inactive';
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
  // todo update signature
  return self;
};

export type Encoded = readonly Monomer.Encoded[];

export type TrieData = Record<string, readonly Monomer.Encoded[]>;

export const hydrate2 = dual<
  (encoded: Encoded) => (self: Polymer) => Polymer,
  (self: Polymer, encoded: Encoded) => Polymer
>(2, (self, encoded) => {
  self.stack = encoded.map(hydrateMono);
  return self;
});

export const hydrate = dual<
  (bundle: TrieData) => (self: Polymer) => Polymer,
  (self: Polymer, bundle: TrieData) => Polymer
>(2, (self, bundle) => {
  if (!(self.id in bundle)) {
    return self;
  }
  self.stack = bundle[self.id].map(hydrateMono);
  delete bundle[self.id];
  return self;
});

export const dehydrate = dual<
  (bundle: TrieData) => (self: Polymer) => TrieData,
  (self: Polymer, bundle: TrieData) => TrieData
>(2, (self, bundle: TrieData) => {
  bundle[self.id] = self.stack.map(dehydrateMono);
  return bundle;
});

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

export type Effector<E = never, R = never> =
  | Effect.Effect<void, E, R>
  | (<E2 = E, R2 = R>() => void | Promise<void> | Effect.Effect<void, E2, R2>);

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
    update  : Effector;
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
  export type Encoded = Required<Monomer>['encoded'];
  export type Signature = Monomer['_tag'][];
}
export type Signature = Monomer['_tag'][];

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
        };
    }
  },
};

const ReducerProto = Object.assign(Object.create(MonomerProto), {
  _tag: STATE,
});

const EffectProto = Object.assign(Object.create(MonomerProto), {
  _tag: EFFECT,
});

const RefProto = Object.assign(Object.create(MonomerProto), {
  _tag: REF,
});

const MemoProto = Object.assign(Object.create(MonomerProto), {
  _tag: MEMO,
});

const ContextProto = Object.assign(Object.create(MonomerProto), {
  _tag: CONTEXT,
});

export const hydrateMono = (encoded: Monomer.Encoded): Monomer => {
  if (Array.isArray(encoded)) {
    switch (encoded[0]) {
      case STATE: {
        const state = Object.create(ReducerProto) as Monomer.State;
        state.encoded = encoded;
        state.state = encoded[1];
        return state;
      }
      case EFFECT: {
        const effect = Object.create(EffectProto) as Monomer.Effect;
        effect.encoded = encoded;
        effect.deps = encoded[1];
        return effect;
      }
      case REF: {
        const ref = Object.create(RefProto) as Monomer.Ref;
        ref.encoded = encoded;
        ref.state = encoded[1];
        return ref;
      }
      case MEMO: {
        const memo = Object.create(MemoProto) as Monomer.Memo;
        memo.encoded = encoded;
        memo.deps = encoded[1];
        return memo;
      }
    }
  }
  switch (encoded) {
    case EFFECT: {
      const effect = Object.create(EffectProto) as Monomer.Effect;
      effect.encoded = encoded;
      return effect;
    }
    case REF: {
      const ref = Object.create(RefProto) as Monomer.Ref;
      ref.encoded = encoded;
      return ref;
    }
    case MEMO: {
      const memo = Object.create(MemoProto) as Monomer.Memo;
      memo.encoded = encoded;
      return memo;
    }
    case CONTEXT: {
      const context = Object.create(ContextProto) as Monomer.Context;
      context.encoded = encoded;
      return context;
    }
  }
};

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
      if (typeof monomer.state === 'function') {
        return REF;
      }
      return [REF, monomer.state];
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

export type Updater =
  | Updater.StateUpdater
  | Updater.EffectUpdater;

export namespace Updater {
  export interface StateUpdater {
    _tag   : 'State';
    monomer: Monomer.State;
    action(): void;
  };
  export interface EffectUpdater {
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
