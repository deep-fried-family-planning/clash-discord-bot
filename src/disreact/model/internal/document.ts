import * as Notify from '#src/disreact/model/internal/core/notify.ts';
import type * as Jsx from '#src/disreact/model/internal/infrastructure/jsx.ts';
import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import type * as Node from '#src/disreact/model/internal/node.ts';
import type * as Polymer from '#src/disreact/model/internal/polymer.ts';
import * as Data from 'effect/Data';
import * as Inspectable from 'effect/Inspectable';
import type * as Mailbox from 'effect/Mailbox';
import * as Pipeable from 'effect/Pipeable';
import type * as Record from 'effect/Record';

const Id = Symbol.for('disreact/document');

export interface Document<A = Node.Node> extends Pipeable.Pipeable,
  Inspectable.Inspectable
{
  [Id]  : typeof Id;
  _hash : string;
  _id   : string;
  _key  : string;
  _next : string | null;
  _props: any;
  data  : any;
  flags : Set<A>;
  hash? : string;
  notify: Notify.Notify<A>;
  phase : string;
  queue : Mailbox.Mailbox<any>;
  root  : A;
  trie  : Record<string, Polymer.Chain>;
}

export const isDocument = <A>(u: unknown): u is Document<A> => typeof u === 'object' && u !== null && Id in u;

export const isClose = <A>(self: Document<A>) => self._next === null;

export const isSameSource = <A>(self: Document<A>) => self._id === self._next;

const Prototype = proto.declare<Document>({
  [Id]: Id,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
});

export const make = (
  _id: string,
  _key: string,
  _hash: string,
  data: any,
  phase: string,
  queue: Mailbox.Mailbox<any>,
  root: Node.Node,
  trie: Record<string, Polymer.Chain> = {},
) =>
  proto.init(Prototype, {
    _id   : _id,
    _key  : _key,
    _hash : _hash,
    _next : _id,
    _props: {},
    data  : proto.ensure({...data}),
    flags : new Set(),
    phase : phase,
    queue : queue,
    root  : root,
    trie  : trie,
  });

export const init = <A>(): Document<A> => {
  throw new Error();
};

export const fork = <A>(self: Document<A>, source: Jsx.Source): Document<A> => {
  throw new Error();
};

export class HydrationError extends Data.TaggedError('HydrationError')<{}> {}

export class DehydrationError extends Data.TaggedError('DehydrationError')<{}> {}

export const mergeNotify = <A>(self: Document<A>, notify: Notify.Notify<A>) => {
  self.notify = Notify.merge(self.notify, notify);
  return self;
};
