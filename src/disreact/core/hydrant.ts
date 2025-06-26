import type * as Document from '#src/disreact/core/document.ts';
import type * as Polymer from '#src/disreact/core/polymer.ts';
import * as proto from '#src/disreact/core/primitives/proto.ts';
import {dual, pipe} from 'effect/Function';
import * as Option from 'effect/Option';
import type * as Pipeable from 'effect/Pipeable';

const TypeId = Symbol.for('disreact/hydrant');

export interface Hydrant extends Pipeable.Pipeable {
  [TypeId]: typeof TypeId;
  id      : string;
  props   : any;
  trie    : Record<string, Polymer.Chain>;
};

const Prototype = proto.type({
  [TypeId]: TypeId,
});

export const make = (id: string, props: any) => {};

export const fromDocument = (document: Document.Document) => document.hydrant;

export const addChain = dual<
  (key: string, chain: Polymer.Chain) => (self: Hydrant) => Hydrant,
  (self: Hydrant, key: string, chain: Polymer.Chain) => Hydrant
>(3, (self, key, chain) => {
  self.trie[key] = chain;
  return self;
});

export const getChain = dual<
  (key: string) => (self: Hydrant) => Option.Option<Polymer.Chain>,
  (self: Hydrant, key: string) => Option.Option<Polymer.Chain>
>(2, (self, key) =>
  pipe(
    self.trie[key],
    Option.fromNullable,
    Option.map((chain) => {
      delete self.trie[key];
      return chain;
    }),
  ),
);
