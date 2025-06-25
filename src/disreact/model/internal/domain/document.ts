import type {Page} from '#src/disreact/model/internal/domain/page.ts';
import type * as Jsx from '#src/disreact/model/internal/infrastructure/jsx.ts';
import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import type * as Node from '#src/disreact/model/internal/domain/node.ts';
import * as Polymer from '#src/disreact/model/internal/domain/polymer.ts';
import {dual, pipe} from 'effect/Function';
import * as Inspectable from 'effect/Inspectable';
import type * as Mailbox from 'effect/Mailbox';
import * as Option from 'effect/Option';
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
  page  : Page;
  hash? : string;
  phase : string;
  queue : Mailbox.Mailbox<any>;
  root  : A;
  trie  : Record<string, Polymer.Chain>;
}

export const isDocument = <A>(u: unknown): u is Document<A> => typeof u === 'object' && u !== null && Id in u;

export const isClose = <A>(self: Document<A>) => self._next === null;

export const isSameSource = <A>(self: Document<A>) => self._id === self._next;

const Prototype = proto.type<Document>({
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

export const hydratePolymer__ = <A>(self: Document<A>, key: string): Option.Option<Polymer.Polymer> =>
  pipe(
    self.trie[key],
    Option.fromNullable,
    Option.map((chain) => {
      delete self.trie[key];
      return Polymer.hydrate(chain);
    }),
  );
export const hydratePolymer = dual<
  <A>(key: string) => (self: Document<A>) => Option.Option<Polymer.Polymer>,
  typeof hydratePolymer__
>(2, hydratePolymer__);

export const dehydratePolymer__ = <A>(self: Document<A>, key: string, polymer: Polymer.Polymer): Document<A> =>
  polymer.pipe(
    Polymer.dehydrate,
    Option.map((chain) => {
      self.trie[key] = chain;
      return self;
    }),
    Option.getOrElse(() => self),
  );
export const dehydratePolymer = dual<
  <A>(key: string, polymer: Polymer.Polymer) => (self: Document<A>) => Document<A>,
  typeof dehydratePolymer__
>(3, dehydratePolymer__);
