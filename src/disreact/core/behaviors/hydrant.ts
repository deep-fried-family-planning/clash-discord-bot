import * as Lineage from '#src/disreact/core/behaviors/lineage.ts';
import type * as Document from '#disreact/core/behaviors/exp/documentold.ts';
import type * as Polymer from '#disreact/core/internal/polymer.ts';
import * as proto from '#src/disreact/core/behaviors/proto.ts';
import * as Inspectable from 'effect/Inspectable';
import {dual, pipe} from 'effect/Function';
import * as Option from 'effect/Option';
import * as Pipeable from 'effect/Pipeable';

export interface Hydrant extends Pipeable.Pipeable,
  Inspectable.Inspectable,
  Lineage.Lineage<Document.Documentold>
{
  hash? : string;
  source: string;
  props : any;
  trie  : Record<string, Polymer.Chain>;
};

const Prototype = proto.type<Hydrant>({
  ...Lineage.Prototype,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id   : 'Hydrant',
      hash  : this.hash,
      source: this.source,
      props : this.props,
      trie  : this.trie,
    });
  },
});

export const make = (input: Partial<Hydrant>) => {
  const
    {
      hash   = '',
      source = '',
      props  = {},
      trie   = {},
    } = input;

  return proto.init(Prototype, {
    hash  : hash,
    source: source,
    props : props,
    trie  : trie,
  });
};

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
