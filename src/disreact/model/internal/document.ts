import {INTERNAL_ERROR} from '#src/disreact/model/internal/core/constants.ts';
import * as Lateral from '#src/disreact/model/internal/core/lateral.ts';
import type * as Polymer from '#src/disreact/model/internal/polymer.ts';
import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import * as Equal from 'effect/Equal';
import {dual} from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Inspectable from 'effect/Inspectable';
import type * as Mailbox from 'effect/Mailbox';
import * as Pipeable from 'effect/Pipeable';
import type * as Record from 'effect/Record';

const Id = Symbol.for('disreact/document');

export interface Document<A = any> extends Pipeable.Pipeable,
  Lateral.Lateral<Document<A>>,
  Hash.Hash,
  Equal.Equal,
  Inspectable.Inspectable
{
  [Id]  : typeof Id;
  _id   : string;
  _key  : string;
  _hash : string;
  _next : string | null;
  _props: any;
  data  : any;
  hash? : string;
  flags : Set<A>;
  phase : string;
  queue : Mailbox.Mailbox<any>;
  root  : A;
  trie  : Record<string, Polymer.Chain>;
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

export const isClose = <A>(d: Document<A>) => d._next === null;

export const isSameSource = <A>(d: Document<A>) => d._id === d._next;

const putChain__ = <A>(d: Document<A>, k: string, p: Polymer.Chain) => {
  if (d.trie[k]) {
    throw new Error(INTERNAL_ERROR);
  }
  d.trie[k] = p;
  return d;
};

export const putChain = dual<
  <A>(k: string, p: Polymer.Chain) => (d: Document<A>) => Document<A>,
  typeof putChain__
>(3, putChain__);

const getChain__ = <A>(d: Document<A>, k: string) => {
  const p = d.trie[k];
  if (!p) {
    return undefined;
  }
  delete d.trie[k];
  return p;
};

export const getChain = dual<
  <A>(k: string) => (d: Document<A>) => Polymer.Polymer | undefined,
  typeof getChain__
>(2, getChain__);

export const dehydrate = <A>(d: Document<A>) => {};

export type Hydrator = {
  hash? : string;
  id    : string;
  key   : string;
  props?: any;
  trie? : Record<string, Polymer.Chain>;
};
