import * as Element from '#src/disreact/model/entity/element.ts';
import * as FC from '#src/disreact/model/entity/fc.ts';
import * as Polymer from '#src/disreact/model/entity/polymer.ts';
import type * as Declarations from '#src/disreact/model/util/declarations.ts';
import * as Stack from '#src/disreact/model/util/stack.ts';
import * as GlobalValue from 'effect/GlobalValue';
import type * as Record from 'effect/Record';

export interface Rehydrant {
  key?     : string;
  id       : string;
  data     : any;
  next     : {id: string | null; props?: any};
  polymers?: {[K in string]: Polymer.Polymer};
  element  : Element.Component;
  stack    : Stack.Stack;
  notify   : Set<Element.Component>;
};

export type Registrant = FC.Any | Element.Element;
export type SourceId = string | FC.Any | Element.Element;
export type Source = {
  id: string;
  el: Element.Component;
};
export type Hydrator = typeof Declarations.Hydrator.Type;
export type Encoded = typeof Declarations.Hydrator.Encoded;

export const source = (src: Registrant, id?: string): Source => {
  const comp = FC.isFC(src)
    ? Element.createRoot(src, {})
    : src;
  if (id) {
    FC.name(comp.type, id);
  }
  return {
    id: FC.id((comp as Element.Component).type)!,
    el: comp as Element.Component,
  };
};

const rehydrant = (id: string, el: Element.Component, data: any): Rehydrant =>
  ({
    id,
    element: el,
    data,
    next   : {id: id},
    stack  : Stack.empty(),
    notify : new Set(),
  });

export const fromSource = (s: Source, p: any, d: any): Rehydrant => {
  const fn = Element.createRoot(s.el.type, p ?? s.el.props);
  const rh = rehydrant(s.id, fn, d);
  return rh;
};

export const fromFC = (f: FC.Any, p: any, d: any): Rehydrant => {
  const comp = Element.createRoot(f, p);
  const rh = rehydrant(FC.id(comp.type)!, comp, d);
  return rh;
};

const pmap = GlobalValue
  .globalValue(Symbol.for('disreact/rehydrant/polymers'), () => new WeakMap<Rehydrant, Record<string, Polymer.Encoded>>());

export const rehydrate = (src: Source, hydrator: Hydrator, data: any): Rehydrant => {
  const cloned = Element.createRoot(src.el.type, hydrator.props);
  const rh = rehydrant(src.id, cloned, data);
  pmap.set(rh, hydrator.stacks as any);
  return rh;
};

export const hydration = (rh: Rehydrant) => pmap.get(rh);

export const dehydrate = (rh: Rehydrant): Hydrator => {
  const s = Stack.make(rh.element);
  const acc = {} as any;

  while (Stack.cont(s)) {
    const n = Stack.pull(s);

    if (Element.isComponent(n)) {
      acc[n._n!] = Polymer.get(n).curr;
    }
    Stack.pushAll(s, n);
  }

  return {
    id    : rh.id,
    props : rh.element.props,
    stacks: acc,
  };
};

export const addNode = (rh: Rehydrant, node: Element.Component) => {
  Stack.push(rh.stack, node);
};

export const getNode = (rh: Rehydrant) => {
  new Set();
};

export const notify = (rh: Rehydrant, node: Element.Component) => {

};
