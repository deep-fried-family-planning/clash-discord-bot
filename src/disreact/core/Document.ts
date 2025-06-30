import type * as Lineage from '#disreact/core/behaviors/lineage.ts';
import type * as Event from '#disreact/core/Event.ts';
import type * as Node from '#disreact/core/Node.ts';
import type * as Inspectable from 'effect/Inspectable';
import type * as Mailbox from 'effect/Mailbox';
import type * as Pipeable from 'effect/Pipeable';

export interface Document extends Pipeable.Pipeable, Inspectable.Inspectable {
  _id      : string;
  _key?    : string;
  _hash    : string;
  body     : Node.Node;
  event?   : Event.Event;
  flags    : Set<Node.Node>;
  outstream: Mailbox.Mailbox<any>;
}
