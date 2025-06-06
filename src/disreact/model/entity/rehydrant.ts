import * as El from '#src/disreact/model/entity/element.ts';
import * as FC from '#src/disreact/model/entity/fc.ts';
import * as Polymer from '#src/disreact/model/entity/polymer.ts';
import type * as Declarations from '#src/disreact/model/util/declarations.ts';
import * as Stack from '#src/disreact/model/util/stack.ts';
import {Structural} from 'effect/Data';
import * as GlobalValue from 'effect/GlobalValue';
import type * as Record from 'effect/Record';
import console from 'node:console';

export declare namespace Rehydrant {
  export type Registrant = FC.Any | El.El;
  export type SourceId = string | FC.Any | El.El;
  export type Source = {
    id: string;
    el: El.Comp;
  };
  export type Rehydrant = {
    id   : string;
    root : El.Comp;
    data : any;
    next : {id: string | null; props?: any};
    stack: Stack.Stack;
  };
  export type Hydrator = typeof Declarations.Hydrator.Type;
  export type Encoded = typeof Declarations.Hydrator.Encoded;
}
export type Registrant = Rehydrant.Registrant;
export type SourceId = Rehydrant.SourceId;
export type Source = Rehydrant.Source;
export type Rehydrant = Rehydrant.Rehydrant;
export type Hydrator = Rehydrant.Hydrator;
export type Encoded = Rehydrant.Encoded;

export const source = (src: Registrant, id?: string): Source => {
  const comp = FC.isFC(src)
    ? El.root(src, {})
    : src;
  if (id) {
    FC.name(comp.type, id);
  }
  return {
    id: FC.id((comp as El.Comp).type)!,
    el: comp as El.Comp,
  };
};

const rehydrant = (id: string, el: El.Comp, data: any): Rehydrant =>
  ({
    id,
    root : el,
    data,
    next : {id: id},
    stack: Stack.empty(),
  });

export const fromSource = (s: Source, p: any, d: any): Rehydrant => {
  const fn = El.root(s.el.type, p ?? s.el.props);
  const rh = rehydrant(s.id, fn, d);
  return rh;
};

export const fromFC = (f: FC.Any, p: any, d: any): Rehydrant => {
  const comp = El.root(f, p);
  const rh = rehydrant(FC.id(comp.type)!, comp, d);
  return rh;
};

const pmap = GlobalValue
  .globalValue(Symbol.for('disreact/rehydrant/polymers'), () => new WeakMap<Rehydrant, Record<string, Polymer.Encoded>>());

export const rehydrate = (src: Source, hydrator: Hydrator, data: any): Rehydrant => {
  const cloned = El.root(src.el.type, hydrator.props);
  const rh = rehydrant(src.id, cloned, data);
  pmap.set(rh, hydrator.stacks as any);
  return rh;
};

export const hydration = (rh: Rehydrant) => pmap.get(rh);

export const dehydrate = (rh: Rehydrant): Hydrator => {
  const s = Stack.make(rh.root);
  const acc = {} as any;

  while (Stack.cont(s)) {
    const n = Stack.pull(s);

    if (El.isComp(n)) {
      acc[n._n!] = Polymer.get(n).curr;
    }
    Stack.pushAll(s, n);
  }

  return {
    id    : rh.id,
    props : rh.root.props,
    stacks: acc,
  };
};

export const addNode = (rh: Rehydrant, node: El.Comp) => {
  Stack.push(rh.stack, node);
};

export const getNode = (rh: Rehydrant) => {
  new Set();
};
