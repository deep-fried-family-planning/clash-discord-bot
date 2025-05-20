import type {Elem} from '#src/disreact/mode/entity/elem.ts';
import type {Hook} from '#src/disreact/mode/hook.ts';
import * as Data from 'effect/Data';
import * as GlobalValue from 'effect/GlobalValue';

const fns = GlobalValue.globalValue(
  Symbol.for('disreact/Fibril/fns'),
  () => new WeakMap<Elem.Fn, Fibril.Fibril>(),
);

export declare namespace Fibril {
  export type Null = null;
  export type State = {s: any};
  export type Dependency = {d: any};
  export type Modal = {m: any};
  export type Message = {e: any};
  export type Monomer =
    | Null
    | State
    | Dependency
    | Modal
    | Message;

  export type Fibril = {
    pc   : number;
    rc   : number;
    stack: any[];
    saved: any[];
    queue: Hook.Effect[];
  };
  export type Encoded = any[];
}
export type Fibril = Fibril.Fibril;
export type Encoded = Fibril.Encoded;

export const isNull = (self: Fibril.Monomer): self is Fibril.Null => self === null;
export const isState = (self: Fibril.Monomer): self is Fibril.State => !!self && 's' in self;
export const isDependency = (self: Fibril.Monomer): self is Fibril.Dependency => !!self && 'd' in self;
export const isModal = (self: Fibril.Monomer): self is Fibril.Modal => !!self && 'm' in self;
export const isMessage = (self: Fibril.Monomer): self is Fibril.Message => !!self && 'e' in self;

export const get = (elem: Elem.Fn): Fibril.Fibril => {
  if (fns.has(elem)) return fns.get(elem)!;
  const fibril = {
    pc   : 0,
    rc   : 0,
    stack: Data.array([] as any[]) as any[],
    saved: Data.array([] as any[]) as any[],
    queue: [],
  } satisfies Fibril.Fibril;
  fns.set(elem, fibril);
  return fibril;
};

export const set = (elem: Elem.Fn, fiber: Fibril.Fibril) => fns.set(elem, fiber);

export const next = <A>(self: Fibril.Fibril, check: (item: any) => item is A, build: () => A): A => {
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

export const commit = (self: Fibril.Fibril) => {
  self.saved = Data.array(structuredClone(self.stack)) as any[];
  self.pc = 0;
  self.rc++;
};

export const decode = (self: Fibril.Encoded): Fibril.Fibril => {
  return {
    pc   : 0,
    rc   : 1,
    stack: Data.array(self) as any[],
    saved: Data.array(self) as any[],
    queue: [],
  };
};

export const encode = (self: Fibril.Fibril): Fibril.Encoded => self.saved;
