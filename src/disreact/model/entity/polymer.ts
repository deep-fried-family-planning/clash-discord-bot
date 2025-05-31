import * as Monomer from '#src/disreact/model/entity/monomer.ts';
import type * as Declarations from '#src/disreact/model/schema/declarations.ts';
import type {El} from '#src/disreact/model/entity/el.ts';
import type {Hook} from '#src/disreact/model/hook.ts';
import * as Data from 'effect/Data';
import * as Equal from 'effect/Equal';
import * as GlobalValue from 'effect/GlobalValue';

export namespace Polymer {
  export type Polymer = {
    pc   : number;
    rc   : number;
    stack: Monomer.Monomer[];
    saved: Monomer.Monomer[];
    queue: Hook.Effect[];
  };
  export type Encoded = Monomer.Monomer[];
}
export type Polymer = Polymer.Polymer;
export type Encoded = Polymer.Encoded;

export const make = (stack?: Monomer.Monomer[]): Polymer.Polymer => {
  if (stack) {
    return Data.struct({
      pc   : 0,
      rc   : 1,
      stack: Monomer.chain(stack),
      saved: Monomer.chain(structuredClone(stack)),
      queue: Data.array([] as Hook.Effect[]) as Hook.Effect[],
    });
  }
  return Data.struct({
    pc   : 0,
    rc   : 0,
    stack: Monomer.chain(),
    saved: Monomer.chain(),
    queue: Data.array([] as Hook.Effect[]) as Hook.Effect[],
  });
};

const __polymers = GlobalValue.globalValue(
  Symbol.for('disreact/polymers'),
  () => new WeakMap<El.Comp, Polymer.Polymer>(),
);

export const get = (elem: El.Comp): Polymer.Polymer => {
  if (__polymers.has(elem)) return __polymers.get(elem)!;
  const polymer = make();
  __polymers.set(elem, polymer);
  return polymer;
};

export const set = (elem: El.Comp, polymer: Polymer.Polymer) => __polymers.set(elem, polymer);

export const dismount = (elem: El.Comp) => __polymers.delete(elem);

export const next = <A extends Monomer.Monomer>(self: Polymer.Polymer, guard: (i: any) => i is A, build: () => A): A => {
  if (self.rc === 0) {
    const item = build();
    self.stack.push(item);
    self.pc++;
    return item;
  }
  const current = self.stack[self.pc];
  if (guard(current)) {
    self.pc++;
    return current;
  }
  throw new Error('Invalid Hook');
};

export const commit = (self: Polymer.Polymer) => {
  self.saved = Data.array(structuredClone(self.stack)) as any[];
  self.pc = 0;
  self.rc++;
};

export const decode = (self: readonly Monomer.Monomer[]): Polymer.Polymer => {
  return {
    pc   : 0,
    rc   : 1,
    stack: Data.array(self) as Monomer.Monomer[],
    saved: Data.array(structuredClone(self)) as Monomer.Monomer[],
    queue: [],
  };
};

export const encode = (self: Polymer.Polymer): Polymer.Encoded => self.saved;

export const changed = (nd: El.Comp) => {
  const polymer = get(nd);
  return Equal.equals(polymer.stack, polymer.saved);
};
