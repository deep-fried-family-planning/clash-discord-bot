import type * as Element from '#src/disreact/codec/adaptor/exp/domain/old/element.ts';
import type * as Declarations from '#src/disreact/codec/old/declarations.ts';
import type * as Lateral from '#src/disreact/core/behaviors/lateral.ts';
import type * as Lineage from '#src/disreact/core/behaviors/lineage.ts';
import type * as Document from '#src/disreact/core/document.ts';
import type * as Node from '#src/disreact/core/node.ts';
import type { MONOMER_STATE} from '#src/disreact/core/primitives/constants.ts';
import type {MONOMER_NONE, MONOMER_EFFECT, MONOMER_REF, MONOMER_CONTEXT, MONOMER_MEMO} from '#src/disreact/core/primitives/constants.ts';
import {INTERNAL_ERROR} from '#src/disreact/core/primitives/constants.ts';
import * as proto from '#src/disreact/core/primitives/proto.ts';
import type * as type from '#src/disreact/core/primitives/type.ts';
import * as Array from 'effect/Array';
import * as Data from 'effect/Data';
import type * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import {dual} from 'effect/Function';
import * as Option from 'effect/Option';
import * as Pipeable from 'effect/Pipeable';

export interface NoneMonomer {
  _tag: typeof MONOMER_NONE;
}

export interface StateMonomer {
  _tag    : typeof MONOMER_STATE;
  state   : any;
  dispatch: (next: any) => any;
}

export interface EffectMonomer {
  _tag  : typeof MONOMER_EFFECT;
  effect: () => any;
  deps? : any[];
}

export interface RefMonomer {
  _tag     : typeof MONOMER_REF;
  reactive?: boolean;
  current  : any;
}

export interface MemoMonomer {
  _tag : typeof MONOMER_MEMO;
  deps?: any[];
}

export interface ContextMonomer {
  _tag: typeof MONOMER_CONTEXT;
}

export type Mono = | NoneMonomer
                  | StateMonomer
                  | EffectMonomer
                  | RefMonomer
                  | MemoMonomer
                  | ContextMonomer;

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

export interface Polymer<A = Node.Node> extends Pipeable.Pipeable,
  Lineage.Lineage<Document.Document<A>>,
  Lateral.Lateral<A>
{
  [TypeId] : typeof TypeId;
  pc       : number;
  rc       : number;
  stack    : Monomer[];
  saved    : Monomer[];
  queue    : EffectFn[];
  strict?  : boolean;
  node?    : undefined | WeakRef<object & A>;
  document?: undefined | WeakRef<Document.Document<A>>;
};

export const isPolymer = (u: unknown): u is Polymer => typeof u === 'object' && u !== null && TypeId in u;

const PolymerProto = proto.type<Polymer>({
  [TypeId]: TypeId,
  pc      : 0,
  rc      : 0,
  node    : undefined,
  document: undefined,
  ...Pipeable.Prototype,
});

export const empty = (): Polymer =>
  proto.init(PolymerProto, {
    rc   : 0,
    pc   : 0,
    stack: chain(),
    saved: chain(),
    queue: [],
  });

export const hydrate = (encoded: Chain): Polymer =>
  proto.init(PolymerProto, {
    pc   : 0,
    rc   : 1,
    stack: chain(encoded),
    saved: chain(structuredClone(encoded)),
    queue: [],
  });

export const strictHydrate = (): Polymer =>
  proto.init(PolymerProto, {
    pc    : 0,
    rc    : 1,
    stack : chain(),
    saved : chain(),
    strict: true,
    queue : [],
  });

export const dehydrate = (p: Polymer): Option.Option<Chain> =>
  p.stack.length === 0
  ? Option.none()
  : Option.some(p.stack);

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

export const beginHook = (self?: Polymer): Polymer => {
  if (!isPolymer(self)) {
    throw new Error('Hooks must be called within a component.');
  }
  return self;
};

export const toNode = (self: Polymer) => self.node!.deref()!;

export const toDocument = (self: Polymer) => self.document!.deref()!;

export const circular = dual<
  (n: Node.Node, d: Document.Document) => (self: Polymer) => Polymer,
  (self: Polymer, n: Node.Node, d: Document.Document) => Polymer
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

export type Bundle = Record<string, Monomer[]>;

export const bundle = (): Bundle => ({});

export const hydrate2 = (ps: Bundle, key: string): Polymer => {
  const encoded = ps[key];

  if (!encoded) {
    return empty();
  }

  const self = proto.init<Polymer>(PolymerProto, {
    pc   : 0,
    rc   : 1,
    stack: chain(encoded),
    saved: chain(structuredClone(encoded)),
    queue: [],
  });

  delete ps[key];
  return self;
};

export const dehydrate2 = (ps: Bundle, key: string, self: Polymer) => {
  if (!self.rc) {
    throw new Error(INTERNAL_ERROR);
  }
  if (self.pc > 0) {
    throw new Error(INTERNAL_ERROR);
  }
  if (self.queue.length) {
    throw new Error(INTERNAL_ERROR);
  }

  ps[key] = self.stack;
};

export const get = (n: Element.Func): Polymer => {
  if (!n.polymer) {
    throw new Error();
  }
  return n.polymer;
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
