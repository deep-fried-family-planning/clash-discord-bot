import type * as Declarations from '#disreact/adaptor/codec/old/declarations.ts';
import type * as Lateral from '#disreact/core/behaviors/lateral.ts';
import type * as Lineage from '#disreact/core/behaviors/lineage.ts';
import type * as Document from '#disreact/core/behaviors/exp/documentold.ts';
import type * as Node from '#disreact/core/behaviors/exp/nodev1.ts';
import {MONOMER_CONTEXTUAL, MONOMER_EFFECT, MONOMER_MEMO, MONOMER_NONE, MONOMER_REF, MONOMER_STATE, POLYMER_STATE_MAKE, POLYMER_STRATEGY_INITIALIZE, POLYMER_STRATEGY_REHYDRATE, POLYMER_STRATEGY_STATELESS, type PolymerState, type PolymerStrategy} from '#disreact/core/immutable/constants.ts';
import * as proto from '#disreact/core/behaviors/proto.ts';
import type * as type from '#disreact/core/behaviors/type.ts';
import * as Inspectable from 'effect/Inspectable';
import * as Array from 'effect/Array';
import * as Data from 'effect/Data';
import type * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import {dual, hole} from 'effect/Function';
import type * as Option from 'effect/Option';
import * as Pipeable from 'effect/Pipeable';

export interface NoneMonomer {
  _tag: typeof MONOMER_NONE;
}

export interface StateMonomer extends Lineage.Lineage<Polymer> {
  _tag    : typeof MONOMER_STATE;
  state   : any;
  dispatch: (next: any) => any;
}

export interface EffectMonomer {
  _tag  : typeof MONOMER_EFFECT;
  effect: () => any;
  deps? : undefined | any[];
}

export interface RefMonomer {
  _tag     : typeof MONOMER_REF;
  reactive?: boolean;
  current  : any;
}

export interface MemoMonomer {
  _tag : typeof MONOMER_MEMO;
  deps?: undefined | any[];
}

export interface ContextMonomer {
  _tag: typeof MONOMER_CONTEXTUAL;
}

export type Mono = | NoneMonomer
                   | StateMonomer
                   | EffectMonomer
                   | RefMonomer
                   | MemoMonomer
                   | ContextMonomer;

const NonePrototype = proto.type<NoneMonomer>({
  _tag: MONOMER_NONE,
});

const StatePrototype = proto.type<StateMonomer>({
  _tag    : MONOMER_STATE,
  state   : undefined,
  dispatch: hole,
});

const EffectPrototype = proto.type<EffectMonomer>({
  _tag  : MONOMER_EFFECT,
  deps  : undefined,
  effect: hole,
});

const RefPrototype = proto.type<RefMonomer>({
  _tag    : MONOMER_REF,
  reactive: false,
  current : null,
});

const MemoPrototype = proto.type<MemoMonomer>({
  _tag: MONOMER_MEMO,
  deps: undefined,
});

const ContextPrototype = proto.type<ContextMonomer>({
  _tag: MONOMER_CONTEXTUAL,
});

export const no = (): NoneMonomer => NonePrototype;

export const s = (initial: any): StateMonomer => {
  const self = proto.init(StatePrototype, {
    state: initial,
  });
  return self;
};

export namespace Monomer {
  export type None = typeof Declarations.Null.Type;
  export type State = typeof Declarations.State.Type;
  export type Deps = typeof Declarations.Dep.Type;
  export type Data = typeof Declarations.Data.Type;
}
export type Monomer = | Monomer.None
                      | Monomer.State
                      | Monomer.Deps
                      | Monomer.Data;

export const isNone  = (self: Monomer): self is Monomer.None => self === null,
             isState = (self: Monomer): self is Monomer.State => !!self && 's' in self,
             isDeps  = (self: Monomer): self is Monomer.Deps => !!self && 'd' in self,
             isData  = (self: Monomer): self is Monomer.Data => !!self && 'a' in self;

const nest = (data: any) => {
  if (!data || typeof data !== 'object' || Equal.symbol in data) {
    return data;
  }
  if (Array.isArray(data)) {
    const acc = [] as any[];
    for (const item of data) {
      acc.push(nest(item));
    }
    return Data.array(acc);
  }
  const acc = {} as any;
  for (const key of Object.keys(data)) {
    acc[key] = nest(data[key]);
  }
  return Data.struct(acc);
};

export const none = (): Monomer.None => null;
export const state = (s: any): Monomer.State => nest({s});
export const deps = (d: any = []): Monomer.Deps => nest(({d}));
export const chain = (c: Chain = []) => Data.array(c) as Chain;

export type Chain = Monomer[];

export interface EffectFn extends type.Fn {
  (): | void
      | Promise<void>
      | E.Effect<void>;
}

const TypeId = Symbol.for('disreact/polymer');

export interface Polymer<A = Node.Nodev1, B = any> extends Pipeable.Pipeable,
  Inspectable.Inspectable,
  Lineage.Lineage<Document.Documentold<A>>,
  Lateral.Lateral<A>
{
  readonly [TypeId]: typeof TypeId;

  strategy : PolymerStrategy;
  state    : PolymerState;
  pc       : number;
  rc       : number;
  stack    : Monomer[];
  saved    : Monomer[];
  queue    : EffectFn[];
  out      : B;
  ready    : boolean;
  strict?  : boolean;
  node?    : undefined | WeakRef<object & A>;
  document?: undefined | WeakRef<Document.Documentold<A>>;
};

export const toNode = (self: Polymer) => self.node!.deref()!;

export const toDocument = (self: Polymer) => self.document!.deref()!;

export const isPolymer = <A, B>(u: unknown): u is Polymer<A, B> => typeof u === 'object' && u !== null && TypeId in u;

const PolymerProto = proto.type<Polymer>({
  [TypeId]: TypeId,
  state   : POLYMER_STATE_MAKE,
  pc      : 0,
  rc      : 0,
  node    : undefined,
  document: undefined,
  ready   : false,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id  : 'Polymer',
      stack: [...this.stack!],
    });
  },
});

export const empty = (): Polymer =>
  proto.init(PolymerProto, {
    strategy: POLYMER_STRATEGY_INITIALIZE,
    rc      : 0,
    pc      : 0,
    stack   : chain(),
    saved   : chain(),
    queue   : [],
  });

export const hydrate = (encoded?: Chain): Polymer =>
  proto.init(PolymerProto, {
    strategy: POLYMER_STRATEGY_REHYDRATE,
    pc      : 0,
    rc      : 1,
    stack   : chain(encoded),
    saved   : chain(structuredClone(encoded)),
    strict  : !encoded,
    queue   : [],
  });

export const strictHydrate = (): Polymer =>
  proto.init(PolymerProto, {
    strategy: POLYMER_STRATEGY_STATELESS,
    pc      : 0,
    rc      : 1,
    stack   : chain(),
    saved   : chain(),
    strict  : true,
    queue   : [],
  });

export const dehydrate = (p: Polymer): Chain | undefined =>
  p.stack.length === 0
  ? undefined
  : p.stack;

export const dispose = <A extends Polymerizes>(a: A): A => {
  if (a.polymer) {
    delete a.polymer?.document;
    delete a.polymer?.node;
    delete a.polymer;
  }
  return a;
};

export const isStrictViolation = (self: Polymer) => {
  if (!self.strict) return false;
  if (self.stack.length) return false;
  return false;
};

export const isTerminal = (self: Polymer) => {
  if (self.rc === 0) {
    return false;
  }
  return self.pc === self.stack.length - 1;
};

export const attachDocument = dual<
  (d: Document.Documentold) => (self: Polymer) => Polymer,
  (self: Polymer, d: Document.Documentold) => Polymer
>(2, (self, d) => {
  self.document = new WeakRef(d);
  return self;
});

export const attachNode = dual<
  (n: Node.Nodev1) => (self: Polymer) => Polymer,
  (self: Polymer, n: Node.Nodev1) => Polymer
>(2, (self, n) => {
  self.node = new WeakRef(n);
  return self;
});

export const circular = dual<
  (n: Node.Nodev1, d: Document.Documentold) => (self: Polymer) => Polymer,
  (self: Polymer, n: Node.Nodev1, d: Document.Documentold) => Polymer
>(
  3, (self, n, d) => {
    self.node = new WeakRef(n);
    self.document = new WeakRef(d);
    return self;
  },
);

export interface Polymerizes {
  polymer?: Polymer;
}

export const fromPolymerized = <A extends Polymerizes>(a: A): Polymer => a.polymer!;

export const polymerize = dual<
  <A extends Polymerizes>(a: A) => (self: Polymer) => A,
  <A extends Polymerizes>(self: Polymer, a: A) => A
>(
  2, (self, a) => {
    a.polymer = self;
    return a;
  },
);

export const next = <A extends Monomer>(p: Polymer, predicate: (i: any) => i is A, lazy: () => A): A => {
  if (p.rc === 0) {
    const item = lazy();
    p.stack.push(item);
    p.pc++;
    return item;
  }
  const current = p.stack[p.pc];
  if (predicate(current)) {
    p.pc++;
    return current;
  }
  throw new Error('Invalid Hook');
};

export const current = (p: Polymer): Monomer | undefined => p.stack[p.pc];

export const advance = (p: Polymer, m: Monomer) => {
  p.pc++;
};

export const commit = (self: Polymer) => {
  if (!self.ready) {
    throw new Error('Cannot commit a component that has not been initialized.');
  }
  self.saved = Data.array(structuredClone(self.stack)) as any[];
  self.pc = 0;
  self.rc++;
  return self;
};

export const enqueue = (p: Polymer, f: EffectFn) => {
  p.queue.push(f);
  return p;
};

export const hasEffects = (p: Polymer) => p.queue.length > 0;

export const flush = (p: Polymer) => {
  const queue = p.queue;
  p.queue = [];
  return queue;
};

export const tap = dual<
  (f: (p: Polymer) => void) => (self: Polymer) => Polymer,
  (self: Polymer, f: (p: Polymer) => void) => Polymer
>(2, (self, f) => {
  f(self);
  return self;
});

export const use = dual<
  <A>(f: (p: Polymer) => A) => (self: Polymer) => A,
  <A>(self: Polymer, f: (p: Polymer) => A) => A
>(2, (self, f) => f(self));
