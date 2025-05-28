import type {El} from '#src/disreact/mode/entity/el.ts';
import type {Hook} from '#src/disreact/mode/hook.ts';
import * as Equal from 'effect/Equal';
import * as Data from 'effect/Data';
import * as GlobalValue from 'effect/GlobalValue';
import type * as Declarations from '#src/disreact/mode/schema/declarations.ts';

const elements = GlobalValue.globalValue(
  Symbol.for('disreact/Polymer/El'),
  () => new WeakMap<El.Comp, Polymer.Polymer>(),
);

export declare namespace Monomer {
  export type Null = typeof Declarations.Null.Type;
  export type State = typeof Declarations.State.Type;
  export type Dep = typeof Declarations.Dep.Type;
  export type Monomer = | Null
                        | State
                        | Dep;
}
export type Monomer = Monomer.Monomer;

export const isNull = (self: Monomer): self is Monomer.Null => self === null;
export const isState = (self: Monomer): self is Monomer.State => !!self && 's' in self;
export const isDep = (self: Monomer): self is Monomer.Dep => !!self && 'd' in self;

export declare namespace Polymer {
  export type Polymer = {
    pc   : number;
    rc   : number;
    stack: Monomer[];
    saved: Monomer[];
    queue: Hook.Effect[];
  };
  export type Encoded = Monomer.Monomer[];
}
export type Polymer = Polymer.Polymer;
export type Encoded = Polymer.Encoded;

export const make = (stack?: Monomer[]): Polymer.Polymer => {
  if (stack) {
    return {
      pc   : 0,
      rc   : 1,
      stack: Data.array(stack) as Monomer[],
      saved: Data.array(structuredClone(stack)) as Monomer[],
      queue: [],
    };
  }
  return {
    pc   : 0,
    rc   : 0,
    stack: Data.array([] as Monomer[]) as Monomer[],
    saved: Data.array([] as Monomer[]) as Monomer[],
    queue: [],
  };
};

export const get = (elem: El.Comp): Polymer.Polymer => {
  if (elements.has(elem)) return elements.get(elem)!;
  const fibril = {
    pc   : 0,
    rc   : 0,
    stack: Data.array([] as Monomer[]) as Monomer[],
    saved: Data.array([] as Monomer[]) as Monomer[],
    queue: [],
  } satisfies Polymer.Polymer;
  elements.set(elem, fibril);
  return fibril;
};

export const set = (elem: El.Comp, fiber: Polymer.Polymer) => elements.set(elem, fiber);

export const dismount = (elem: El.Comp) => elements.delete(elem);

export const next = <A extends Monomer.Monomer>(self: Polymer.Polymer, check: (item: any) => item is A, build: () => A): A => {
  if (self.rc > 0) {
    const item = build();
    self.stack.push(item);
    self.pc++;
    return item;
  }
  const current = self.stack[self.pc];
  if (check(current)) {
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
