import type {Elem} from '#src/disreact/model/entity/elem.ts';
import type {Rehydrant} from '#src/disreact/model/rehydrant.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import * as Data from 'effect/Data';
import * as Equal from 'effect/Equal';

export type Monomer =
  | Null
  | State
  | Dependency
  | Modal
  | Message;

export type Null = null;
export type State = {s: any};
export type Dependency = {d: any};
export type Modal = {m: any};
export type Message = {e: any};

export const Null = S.Null;
export const State = S.Struct({s: S.Any});
export const Dependency = S.Struct({d: S.Any});
export const Modal = S.Struct({m: S.Any});
export const Message = S.Struct({e: S.Any});
export const Any = S.Union(Null, State, Dependency, Modal, Message);

export const isNull = (self: Monomer): self is Null => self === null;
export const isState = (self: Monomer): self is State => !!self && 's' in self;
export const isDependency = (self: Monomer): self is Dependency => !!self && 'd' in self;
export const isModal = (self: Monomer): self is Modal => !!self && 'm' in self;
export const isMessage = (self: Monomer): self is Message => !!self && 'e' in self;

export const Chain = S.mutable(S.Array(Any));
export type Chain = typeof Chain.Type;

export const TypeId = Symbol('disreact/Fibril');

export * as Fibril from '#src/disreact/model/entity/fibril.ts';
export type Fibril = {
  pc       : number;
  stack    : Chain;
  saved    : any[];
  rc       : number;
  queue    : any[];
  elem     : Elem.Task;
  rehydrant: Rehydrant;
};

export const make = (stack?: Chain): Fibril => {
  return {
    pc       : 0,
    stack    : stack ?? [],
    saved    : [],
    rc       : 0,
    queue    : [],
    elem     : null as unknown as Elem.Task,
    rehydrant: null as unknown as Rehydrant,
  };
};

export const clone = (self: Fibril): Fibril => {
  const {elem, rehydrant, ...rest} = self;
  return structuredClone(rest) as Fibril;
};

export const isSame = (self: Fibril) => {
  const a = self.stack;
  const b = self.saved;

  if (a.length !== b.length) {
    return false;
  }

  const stackData = Data.array(self.stack.map((s) => s === null ? null : Data.struct(s)));
  const priorData = Data.array(self.saved.map((s) => s === null ? null : Data.struct(s)));

  return Equal.equals(stackData, priorData);
};

export const init = (root: Rehydrant, task: Elem.Task, fibril: Fibril) => {
  fibril.elem = task;
  fibril.rehydrant = root;
  root.fibrils[task.id!] = fibril;
  fibril.pc = 0;
  fibril.rc = 0;
};

export const connect = (root: Rehydrant, task: Elem.Task, fibril: Fibril) => {
  fibril.elem = task;
  fibril.rehydrant = root;
  root.fibrils[task.id!] = fibril;
  fibril.pc = 0;
};

export const hydrate = (root: Rehydrant, task: Elem.Task, fibril: Fibril) => {
  fibril.elem = task;
  fibril.rehydrant = root;
  root.fibrils[task.id!] = fibril;
  fibril.pc = 0;
  fibril.rc = 1;
};

export const commit = (self: Fibril) => {
  self.pc = 0;
  self.saved = structuredClone(self.stack);
  self.rc++;
};
