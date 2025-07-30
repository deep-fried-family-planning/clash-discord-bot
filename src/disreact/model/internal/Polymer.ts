import type * as Traversable from '#disreact/model/core/Traversable.ts';
import type * as Element from '#disreact/model/entity/Element.ts';
import {declareProto, fromProto} from '#disreact/util/proto.ts';
import type * as Effect from 'effect/Effect';
import {dual} from 'effect/Function';
import {globalValue} from 'effect/GlobalValue';
import * as Inspectable from 'effect/Inspectable';
import * as MutableRef from 'effect/MutableRef';
import * as Pipeable from 'effect/Pipeable';

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
  export type Dehydrated = Required<Monomer>['encoded'];
  export type Signature = Monomer['_tag'][];
}
export type Signature = Monomer['_tag'][];

const MonomerProto = declareProto<Monomer>({
  _tag   : STATE as any,
  state  : undefined as any,
  deps   : undefined as any,
  init   : undefined as any,
  update : undefined as any,
  changed: false,
  queued : false,
  encoded: undefined as any,
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
});

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

export const reducer = (): Monomer.State => {
  const self = fromProto(ReducerProto);
  return self;
};

export const effect = (): Monomer.Effect => {
  const self = fromProto(EffectProto);
  return self;
};

export const ref = (): Monomer.Ref => {
  const self = fromProto(RefProto);
  return self;
};

export const memo = (): Monomer.Memo => {
  const self = fromProto(MemoProto);
  return self;
};

export const context = (): Monomer.Context => {
  const self = fromProto(ContextProto);
  return self;
};

export const hydrateMono = (encoded: Monomer.Dehydrated): Monomer => {
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

const dehydrateMono = (monomer: Monomer): Monomer.Dehydrated => {
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

type MTag = Monomer['_tag'];
type Mono<T extends MTag = MTag> = Extract<Monomer, {_tag: T}>;

export interface Polymer extends Inspectable.Inspectable,
  Pipeable.Pipeable,
  Traversable.Origin<Element.Element>
{
  stage    : 'Init' | 'Hydrate' | 'Rerender';
  type     : any;
  id       : string;
  pc       : number;
  rc       : number;
  stack    : Monomer[];
  fc?      : Element.FC;
  signature: Monomer.Signature;
  queue    : any[];
  flag(): void;
}

export type Dehydrated = readonly Monomer.Dehydrated[];

export type Bundle = Record<string, readonly Monomer.Dehydrated[]>;

const PolymerProto: Polymer = {
  stage: 'Init',
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
  self.origin = elem;
  self.signature = [];
  self.stack = [];
  self.queue = [];
  return self;
};

export const fromEncoded = (elem: Element.Element, encoded: Dehydrated): Polymer => {
  const self = make(elem);
  self.stage = 'Hydrate';
  self.stack = encoded.map(hydrateMono);
  return self;
};

export const toEncoded = (self: Polymer): Dehydrated => self.stack.map(dehydrateMono);

export const commit = (self: Polymer): Polymer => {
  self.stage = 'Rerender';
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

export const dispose = (self: Polymer) => {
  if (self.queue.length) {
    throw new Error('ope');
  }
  (self.origin as any) = undefined;
  (self.stack as any) = undefined;
  (self.queue as any) = undefined;
  return undefined;
};

export const isStateless = (self: Polymer) => self.stack.length === 0;

export const isPending = (self: Polymer) => self.queue.length > 0;

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

export const current = globalValue(
  Symbol.for('disreact/current'),
  () => MutableRef.make(undefined as undefined | Polymer),
);

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

export class HookError extends Error {
  readonly _tag = 'HookError';
}

export const defineHookDual = dual<
  <M extends Monomer, I extends any[], O>(
    make: (p: Polymer, ...i: I) => M,
    init: (p: Polymer, m: M, ...i: I) => O,
    hydrate: (p: Polymer, m: M, ...i: I) => O,
    update: (p: Polymer, m: M, ...i: I) => O,
  ) => (self: Polymer) => (...i: I) => O,
  <M extends Monomer, I extends any[], O>(
    self: Polymer,
    make: (p: Polymer, ...i: I) => M,
    init: (p: Polymer, m: M, ...i: I) => O,
    hydrate: (p: Polymer, m: M, ...i: I) => O,
    update: (p: Polymer, m: M, ...i: I) => void,
  ) => (...i: I) => O
>(5, (self, make, init, hydrate, update) => (...i) => {
  if (self.stage === 'Init') {
    const monomer = make(self, ...i);
    const output = init(self, monomer, ...i);
    self.stack.push(monomer);
    self.pc++;
    return output;
  }
  if (self.stage === 'Hydrate') {
    throw new Error('unimplemented');
  }
  throw new Error('unimplemented');
});
