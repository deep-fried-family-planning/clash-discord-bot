import type * as Event from '#disreact/core/Event.ts';
import type * as Hydrant from '#disreact/core/Hydrant.ts';
import type * as Node from '#disreact/core/Node.ts';
import * as document from '#disreact/core/internal/document.ts';
import * as E from 'effect/Effect';
import type * as Inspectable from 'effect/Inspectable';
import * as Mailbox from 'effect/Mailbox';
import type * as Pipeable from 'effect/Pipeable';
import type * as Deferred from 'effect/Deferred';
import type * as Polymer from '#disreact/core/Polymer.ts';

export interface Endpoint extends Inspectable.Inspectable {

}

export interface Document<A = any> extends Pipeable.Pipeable, Inspectable.Inspectable {
  _id        : string;
  _key?      : string;
  _hash      : string;
  body       : Node.Node;
  interaction: A;
  event?     : Event.Event;
  flags      : Set<Node.Func>;
  outstream  : Mailbox.Mailbox<any>;
  endpoint   : Hydrant.Endpoint;
  hydrant    : Hydrant.Hydrant;
  deferred   : Deferred.Deferred<any>;
  trie       : Record<string, Polymer.Polymer>;
}

export const make = (body: Node.Node): E.Effect<Document> =>
  E.map(Mailbox.make(), (outstream) => {
    const self = document.make(body);
    self.outstream = outstream;
    return self;
  });

export const getFlags = (self: Document) => document.getFlags(self);
