import type * as Event from '#disreact/core/Event.ts';
import type * as Node from '#disreact/core/Node.ts';
import * as document from '#disreact/core/primitives/document.ts';
import * as E from 'effect/Effect';
import type * as Inspectable from 'effect/Inspectable';
import * as Mailbox from 'effect/Mailbox';
import type * as Pipeable from 'effect/Pipeable';

export interface Document<A = any> extends Pipeable.Pipeable, Inspectable.Inspectable {
  _id      : string;
  _key?    : string;
  _hash    : string;
  body     : Node.Node;
  data     : A;
  event?   : Event.Event;
  flags    : Set<Node.Node>;
  outstream: Mailbox.Mailbox<any>;
}

const makeOutstream = Mailbox.make();

export const make = (body: Node.Node): E.Effect<Document> => E.map(makeOutstream, (outstream) => {
  const self = document.make(body);
  self.outstream = outstream;
  return self;
});

export const getFlags = (self: Document) => document.getFlags(self);
