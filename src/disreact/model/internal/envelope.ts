/* eslint-disable prefer-rest-params */
import type * as Declarations from '#src/disreact/codec/old/declarations.ts';
import type * as FC from '#src/disreact/codec/fc.ts';
import * as Element from '#src/disreact/model/internal/core/element.ts';
import * as Polymer from '#src/disreact/model/internal/polymer.ts';
import type * as Stack from '#src/disreact/model/internal/stack.ts';
import * as Proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import type {Relay} from '#src/disreact/model/Relay.ts';
import * as Pipeable from 'effect/Pipeable';
import * as Order from 'effect/Order';

export interface Rehydrant {
  key? : string | number | bigint | undefined;
  root : string;
  props: any;
  trie : { [K in string]: Polymer.Monomer[] };
}

export interface Envelope extends Pipeable.Pipeable {
  relay: Relay;
  key? : string | undefined;
  id   : string;
  data : any;
  next : {id: string | null; props?: any};
  trie : Polymer.Bundle;
  root : Element.Element;
  queue: Set<Element.Func>;
};

const RehydrantProto = Proto.declare<Envelope>({
  pipe() {
    return Pipeable.pipeArguments(this, arguments);
  },
});

const make = (id: string, root: Element.Element, data: any): Envelope =>
  Proto.instance(RehydrantProto, {
    id   : id,
    data : data,
    next : {id: id},
    root : root,
    trie : Polymer.bundle(),
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

export const hasFlags = (self: Envelope) => self.queue.size > 0;

export const enqueueRender = (env: Envelope, n: Element.Func) => {
  env.queue.add(n);
  return env;
};

export const dequeueRender = (env: Envelope) => {
  const ns = [...env.queue];
  return Element.lca(ns);
};

export const dehydrate = (rh: Envelope): Hydrator => {
  return {
    key   : rh.key,
    id    : rh.id,
    props : rh.root.props,
    stacks: rh.trie,
  };
};
