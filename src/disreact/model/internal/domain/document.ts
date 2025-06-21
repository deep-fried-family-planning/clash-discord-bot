import * as Lateral from '#src/disreact/model/internal/core/lateral.ts';
import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import type * as Polymer from '#src/disreact/model/internal/domain/polymer.ts';
import * as Equal from 'effect/Equal';
import {dual} from 'effect/Function';
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
  [Id]  : typeof Id;
  _id   : string;
  _key  : string;
  _hash : string;
  _next : string;
  _props: any;
  data  : any;
  hash? : string;
  flags : Set<A>;
  phase : string;
  queue : Mailbox.Mailbox<any>;
  root  : A;
  trie  : Record<string, Polymer.Polymer>;
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

export const __putPolymer = <A>(d: Document<A>, k: string, p: Polymer.Polymer) => {
  d.trie[k] = p;
  return d;
};

export const putPolymer = dual<
  <A>(k: string, p: Polymer.Polymer) => (d: Document<A>) => Document<A>,
  typeof __putPolymer
>(3, __putPolymer);

export const __getPolymer = <A>(d: Document<A>, k: string) => {
  const p = d.trie[k];
  delete d.trie[k];
  return p;
};

export const getPolymer = dual<
  <A>(k: string) => (d: Document<A>) => Polymer.Polymer | undefined,
  typeof __getPolymer
>(2, __getPolymer);

// todo
export const isSameSource = <A>(d: Document<A>, r: A) => d.root === r;

export const isClose = <A>(d: Document<A>, r: A) => d.root === r;

export const isDifferentSource = <A>(d: Document<A>, r: A) => d.root !== r;
