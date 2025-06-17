import type * as Declarations from '#src/disreact/codec/old/declarations.ts';
import type * as FC from '#src/disreact/codec/fc.ts';
import * as Element from '#src/disreact/model/internal/element.ts';
import * as Polymer from '#src/disreact/model/internal/polymer.ts';
import * as Stack from '#src/disreact/model/internal/stack.ts';
import * as Proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import * as Order from 'effect/Order';

export interface Rehydrant {
  key? : string | number | bigint | undefined;
  root : string;
  props: any;
  trie : { [K in string]: Polymer.Monomer[] };
}

export interface Envelope {
  key? : string | undefined;
  id   : string;
  data : any;
  next : {id: string | null; props?: any};
  trie : Polymer.Bundle;
  root : Element.Element;
  stack: Stack.Stack;
  queue: Set<Element.Instance>;
};

export const enqueue = (env: Envelope, n: Element.Instance) => {
  env.queue.add(n);
  return env;
};

export const dequeue = (env: Envelope) => {
  const ns = [...env.queue];
  return Element.lca(ns);
};

const RehydrantProto = Proto.make<Envelope>({});

const make = (id: string, root: Element.Element, data: any): Envelope =>
  Proto.create(RehydrantProto, {
    id   : id,
    data : data,
    next : {id: id},
    root : root,
    stack: Stack.empty(),
    trie : {},
    queue: new Set(),
  });

export type Registrant = FC.Any | Element.Element;
export type SourceId = string | FC.Any | Element.Element;
export type Hydrator = typeof Declarations.Hydrator.Type;

export const fromSource = (src: Element.Source, p: any, d: any): Envelope => {
  const root = Element.createRootFromSource(src, p ?? src.props);
  const self = make(Element.getSourceId(root)!, root, d);
  return self;
};

export const fromFC = (f: FC.Any, p: any, d: any): Envelope => {
  const comp = Element.createRootFromFC(f, p);
  const self = make(Element.getSourceId(comp.type)!, comp, d);
  return self;
};

export const rehydrate = (src: Element.Source, hydrator: Hydrator, data: any): Envelope => {
  const root = Element.createRootFromSource(src, hydrator.props);
  const self = make(Element.getSourceId(root)!, root, data);

  self.trie = hydrator.stacks as any;

  return self;
};

export const dehydrate = (rh: Envelope): Hydrator => {
  if (Stack.next(rh.stack)) {
    throw new Error('Envelope is still in progress');
  }
  Stack.reset(rh.stack);
  Stack.push(rh.stack, rh.root);

  const acc = {} as any;

  while (Stack.next(rh.stack)) {
    const n = Stack.pull(rh.stack);

    if (Element.isInstance(n)) {
      acc[n._n!] = Polymer.dehydrate(n.polymer!);
    }

    Stack.pushNodes(rh.stack, n);
  }

  return {
    key   : rh.key,
    id    : rh.id,
    props : rh.root.props,
    stacks: acc,
  };
};

export const cont = (rh: Envelope) => Stack.next(rh.stack);

export const pull = (rh: Envelope) => Stack.pull(rh.stack);

export const push = (rh: Envelope, n: Element.Element) => {
  Stack.push(rh.stack, n);
};

export const pushChildren = (rh: Envelope, n: Element.Element) =>
  Stack.pushNodes(rh.stack, n);
