import type * as El from '#src/disreact/model/entity/element.ts';
import type * as Hook from '#src/disreact/model/lifecycle/hook.ts';
import type {Rehydrant} from '#src/disreact/model/entity/rehydrant.ts';
import type * as Declarations from '#src/disreact/model/util/declarations.ts';
import * as Array from 'effect/Array';
import * as Data from 'effect/Data';
import * as Equal from 'effect/Equal';
import * as Equivalence from 'effect/Equivalence';
import {pipe} from 'effect/Function';
import * as GlobalValue from 'effect/GlobalValue';

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
export const chain = (c: Monomer[] = []) => Data.array(c) as Monomer[];

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
  export type Encoded = Monomer[];
}
export type Polymer = Polymer.Polymer;
export type Encoded = Polymer.Encoded;

export const empty = (): Polymer =>
  Data.struct({
    pc   : 0,
    rc   : 0,
    curr : chain(),
    save : chain(),
    queue: [],
  });

export const rehydrated = (m: Monomer[]): Polymer =>
  Data.struct({
    pc   : 0,
    rc   : 1,
    curr : chain(m),
    save : chain(structuredClone(m)),
    queue: [],
  });

const polymers = GlobalValue
  .globalValue(Symbol.for('disreact/polymers'), () => new WeakMap<El.Comp, Polymer>());

export const get = (fn: El.Comp): Polymer => {
  if (polymers.has(fn)) {
    return polymers.get(fn)!;
  }
  const polymer = empty();
  polymers.set(fn, polymer);
  return polymer;
};

export const set = (fn: El.Comp, p: Polymer) => polymers.set(fn, p);

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

export const changed = pipe(
  Equal.equivalence(),
  Equivalence.array<Monomer>,
);

export const current = (p: Polymer): Monomer | undefined => p.curr[p.pc];

export const advance = (p: Polymer) => {
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
