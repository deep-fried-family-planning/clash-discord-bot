import * as Lateral from '#src/disreact/model/internal/core/lateral.ts';
import type * as Polymer from '#src/disreact/model/internal/polymer.ts';
import type * as Stack from '#src/disreact/model/internal/stack.ts';
import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Inspectable from 'effect/Inspectable';
import type * as Mailbox from 'effect/Mailbox';
import * as Pipeable from 'effect/Pipeable';

const Id = Symbol.for('disreact/document');

export interface Document<A = any> extends Pipeable.Pipeable,
  Lateral.Lateral<Document<A>>,
  Hash.Hash,
  Equal.Equal,
  Inspectable.Inspectable
{
  [Id]   : typeof Id;
  _id    : string;
  _key   : string;
  _hash  : string;
  _next  : string;
  _props : any;
  request: any;
  hash?  : string;
  flags  : Set<A>;
  phase  : string;
  queue  : Mailbox.Mailbox<any>;
  root   : A;
  stacks : Set<Stack.Stack<A>>;
  trie   : Record<string, Polymer.Polymer>;
}

const Prototype = proto.declare<Document>({
  [Id]: Id,
  ...Pipeable.Prototype,
  ...Lateral.Prototype,
  ...Inspectable.BaseProto,
  [Hash.symbol]() {
    return Hash.structure(this);
  },
  [Equal.symbol](that: any) {
    return (
      this._id === that._id
      && this._key === that._key
      && this.hash === that._hash
    );
  },
});

export const make = <A>(
  _id: string,
  _key: string,
  _hash: string,
  data: any,
  phase: string,
  queue: Mailbox.Mailbox<any>,
  root: A,
  trie: Record<string, Polymer.Polymer> = {},
) =>
  proto.instance(Prototype, {
    _id    : _id,
    _key   : _key,
    _hash  : _hash,
    _next  : _id,
    _props : {},
    request: proto.ensure({...data}),
    flags  : new Set(),
    phase  : phase,
    queue  : queue,
    root   : root,
    stacks : new Set(),
    trie   : trie,
  });
