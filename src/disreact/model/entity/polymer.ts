import type * as El from '#src/disreact/model/entity/element.ts';
import type * as Hook from '#src/disreact/model/hook.ts';
import type * as Rehydrant from '#src/disreact/model/entity/rehydrant.ts';
import type * as Declarations from '#src/disreact/model/util/declarations.ts';
import * as Proto from '#src/disreact/model/entity/proto.ts';
import * as Array from 'effect/Array';
import * as Data from 'effect/Data';
import * as Equal from 'effect/Equal';
import * as Equivalence from 'effect/Equivalence';
import {pipe} from 'effect/Function';
import * as GlobalValue from 'effect/GlobalValue';

export const MonomerId = Symbol.for('disreact/monomer');
export const EncodeId = Symbol.for('disreact/encode');

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
export const chain = (c: Encoded = []) => Data.array(c) as Monomer[];

export namespace Polymer {
  export type Polymer = {
    pc   : number;
    rc   : number;
    curr : Monomer[];
    save : Monomer[];
    queue: Hook.Effect[];
    root?: WeakRef<Rehydrant.Rehydrant>;
    lock?: number;
  };
  export type Encoded = readonly Monomer[];
}
export type Polymer = Polymer.Polymer;
export type Encoded = Polymer.Encoded;

export const empty = (): Polymer =>
  ({
    pc   : 0,
    rc   : 0,
    curr : chain(),
    save : chain(),
    queue: [],
  });

export const rehydrate = (ms: Encoded): Polymer =>
  ({
    pc   : 0,
    rc   : 1,
    curr : chain(ms),
    save : chain(structuredClone(ms)),
    queue: [],
  });

export const dehydrate = (n: El.Component): Encoded => {
  const self = get(n);
  if (!self.rc) {
    throw new Error();
  }
  if (self.pc > 0) {
    throw new Error();
  }
  if (self.queue.length) {
    throw new Error();
  }
  return self.curr;
};

const polymers = GlobalValue
  .globalValue(
    Symbol.for('disreact/polymers'),
    () => new WeakMap<El.Component, Polymer>(),
  );

export const get = (fn: El.Component): Polymer => {
  if (polymers.has(fn)) {
    return polymers.get(fn)!;
  }
  const polymer = empty();
  polymers.set(fn, polymer);
  return polymer;
};

export const set = (fn: El.Component, p: Polymer) => polymers.set(fn, p);

export const next = <A extends Monomer>(p: Polymer, predicate: (i: any) => i is A, lazy: () => A): A => {
  if (p.rc === 0) {
    const item = lazy();
    p.curr.push(item);
    p.pc++;
    return item;
  }
  const current = p.curr[p.pc];
  if (predicate(current)) {
    p.pc++;
    return current;
  }
  throw new Error('Invalid Hook');
};

export const current = (p: Polymer): Monomer | undefined => p.curr[p.pc];

export const advance = (p: Polymer, m: Monomer) => {
  p.pc++;
};

export const isTerminal = (p: Polymer) => {
  if (p.rc === 0) {
    return false;
  }
  return p.pc === p.curr.length - 1;
};

export const commit = (p: Polymer) => {
  delete p.lock;
  p.save = Data.array(structuredClone(p.curr)) as any[];
  p.pc = 0;
  p.rc++;
};

export const done = (n: El.Component) => {
  const polymer = polymers.get(n)!;
  delete polymer.lock;
  polymer.save = Data.array(structuredClone(polymer.curr)) as any[];
  polymer.pc = 0;
  polymer.rc++;
};
