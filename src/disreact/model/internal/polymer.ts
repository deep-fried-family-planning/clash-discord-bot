import type * as Element from '#src/disreact/model/internal/core/element.ts';
import * as Proto from '#src/disreact/model/internal/infrastructure/prototype.ts';
import * as Const from '#src/disreact/model/internal/infrastructure/enum.ts';
import type * as Declarations from '#src/disreact/codec/old/declarations.ts';
import * as Array from 'effect/Array';
import * as Data from 'effect/Data';
import type * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import * as Pipeable from 'effect/Pipeable';
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

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

export interface EffectFn extends Function {
  (): | void
      | Promise<void>
      | E.Effect<void>;
}

export interface Polymer extends Pipeable.Pipeable {
  pc     : number;
  rc     : number;
  lk?    : number;
  stack  : Monomer[];
  saved  : Monomer[];
  queue  : EffectFn[];
  unmount: EffectFn[];
};

const PolymerProto = Proto.declare<Polymer>({
  ...Pipeable.Prototype,
});

export const empty = (): Polymer =>
  Proto.create<Polymer>(PolymerProto, {
    rc   : 0,
    pc   : 0,
    stack: chain(),
    saved: chain(),
    queue: [],
  });

export const rehydrate = (ms: Chain): Polymer =>
  Proto.create<Polymer>(PolymerProto, {
    pc   : 0,
    rc   : 1,
    stack: chain(ms),
    saved: chain(structuredClone(ms)),
    queue: [],
  });

export const dehydrate = (self: Polymer): Chain => {
  if (!self.rc) {
    throw new Error();
  }
  if (self.pc > 0) {
    throw new Error();
  }
  if (self.queue.length) {
    throw new Error();
  }
  return self.stack;
};

export const get = (n: Element.Comp): Polymer => {
  if (!n.polymer) {
    throw new Error();
  }
  return n.polymer;
};


export const isTerminal = (p: Polymer) => {
  if (p.rc === 0) {
    return false;
  }
  return p.pc === p.stack.length - 1;
};

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
  delete self.lk;
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

export const hydrate = (ps: Bundle, key: string): Polymer => {
  const chain = ps[key];
  if (!chain) {
    return empty();
  }
  const hydrated = rehydrate(chain);
  delete ps[key];
  return hydrated;
};
