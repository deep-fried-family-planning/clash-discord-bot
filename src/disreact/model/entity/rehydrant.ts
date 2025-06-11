import {trie} from '#src/disreact/model/entity/element.ts';
import * as Element from '#src/disreact/model/entity/element.ts';
import type * as FC from '#src/disreact/model/entity/fc.ts';
import * as Polymer from '#src/disreact/model/entity/polymer.ts';
import * as Proto from '#src/disreact/model/entity/proto.ts';
import type * as Declarations from '#src/disreact/model/util/declarations.ts';
import * as Stack from '#src/disreact/model/util/stack.ts';
import {pipe} from 'effect/Function';
import * as GlobalValue from 'effect/GlobalValue';
import * as Order from 'effect/Order';
import * as Record from 'effect/Record';
import * as SortedSet from 'effect/SortedSet';
import * as Trie from 'effect/Trie';

export interface Rehydrant {
  key? : string | undefined;
  id   : string;
  data : any;
  next : {id: string | null; props?: any};
  trie : Trie.Trie<Polymer.Encoded>;
  root : Element.Element;
  stack: Stack.Stack;
  queue: Set<Element.Component>;
};

export const restore = (rh: Rehydrant, node: Element.Component) => {
  if (!node._n) {
    throw new Error();
  }
  if (Trie.has(rh.trie, node._n)) {
    const encoded = Trie.unsafeGet(rh.trie, node._n);
    const polymer = Polymer.rehydrate(encoded);

    Polymer.set(node, polymer);
    rh.trie = Trie.remove(rh.trie, node._n);

    return polymer;
  }
  return;
};

export const trieSize = (rh: Rehydrant) => Trie.size(rh.trie);

const ord = Order.combineAll([
  Order.mapInput(Order.number, (n: Element.Component) => n.$d),
  Order.mapInput(Order.number, (n: Element.Component) => n.$p),
]);

export const enqueue = (rh: Rehydrant, node: Element.Component) => {
  rh.queue.add(node);
};

export const dequeue = (rh: Rehydrant) => {
  const ns = Array.from(rh.queue);

  switch (ns.length) {
    case 0: {
      return;
    }
    case 1: {
      const [n] = ns;
      rh.queue.clear();
      return n;
    }
  }
  ns.sort(ord);
  const [a, b] = ns;
  rh.queue.clear();
  return a;
};

const sortedQueue = () =>
  pipe(
    Order.combineAll([
      Order.mapInput(Order.number, (n: Element.Component) => n.$d),
      Order.mapInput(Order.number, (n: Element.Component) => n.$p),
    ]),
    SortedSet.empty,
  );

const RehydrantProto = Proto.make<Rehydrant>({
  key  : undefined,
  id   : '',
  data : {},
  next : {id: '', props: {}},
  trie : Trie.empty(),
  root : {} as any,
  stack: Stack.empty(),
  queue: new Set(),
});

const make = (id: string, root: Element.Element, data: any): Rehydrant =>
  Proto.extend<Rehydrant>(
    RehydrantProto,
    {
      id   : id,
      data : data,
      next : {id: id},
      root : root,
      stack: Stack.empty(),
      trie : Trie.empty(),
      queue: new Set(),
    },
  );

export type Registrant = FC.Any | Element.Element;
export type SourceId = string | FC.Any | Element.Element;
export type Source = {
  id: string;
  el: Element.Component;
};
export type Hydrator = typeof Declarations.Hydrator.Type;
export type Encoded = typeof Declarations.Hydrator.Encoded;

export const fromSource = (src: Element.Source, p: any, d: any): Rehydrant => {
  const root = Element.createRootFromSource(src, p ?? src.props);
  const self = make(Element.getSourceId(root)!, root, d);
  return self;
};

export const fromFC = (f: FC.Any, p: any, d: any): Rehydrant => {
  const comp = Element.createRoot(f, p);
  const self = make(Element.getSourceId(comp.type)!, comp, d);
  return self;
};

export const rehydrate = (src: Element.Source, hydrator: Hydrator, data: any): Rehydrant => {
  const root = Element.createRootFromSource(src, hydrator.props);
  const self = make(Element.getSourceId(root)!, root, data);
  self.trie = pipe(
    hydrator.stacks,
    Record.toEntries,
    Trie.fromIterable,
  );
  return self;
};

export const dehydrate = (rh: Rehydrant): Hydrator => {
  if (Stack.cont(rh.stack)) {
    throw new Error('Cannot dehydrate a rehydrant that is still in progress');
  }
  Stack.reset(rh.stack);
  Stack.push(rh.stack, rh.root);

  const acc = {} as any;

  while (Stack.cont(rh.stack)) {
    const n = Stack.pull(rh.stack);

    if (Element.isComponent(n)) {
      acc[n._n!] = Polymer.dehydrate(n);
    }

    Stack.pushAll(rh.stack, n);
  }

  return {
    key   : rh.key,
    id    : rh.id,
    props : rh.root.props,
    stacks: acc,
  };
};

export const cont = (rh: Rehydrant) => Stack.cont(rh.stack);

export const pull = (rh: Rehydrant) => Stack.pull(rh.stack);

export const push = (rh: Rehydrant, n: Element.Element) => {
  Stack.push(rh.stack, n);
};

export const pushChildren = (rh: Rehydrant, n: Element.Element) =>
  Stack.pushAll(rh.stack, n);
