import * as Lineage from '#src/disreact/core/behaviors/lineage.ts';
import type * as Vertex from '#src/disreact/adaptor/codec/adaptor/exp/vertex.ts';
import * as proto from '#src/disreact/core/primitives/proto.ts';
import {dual} from 'effect/Function';
import * as Pipeable from 'effect/Pipeable';

const TypeId = Symbol.for('disreact/valence');

export interface Valence<A = any> extends Pipeable.Pipeable,
  Array<A>,
  Lineage.Lineage<Vertex.Vertex<A>>
{
  [TypeId]: typeof TypeId;
}

export const isValence = <A>(u: unknown): u is Valence<A> =>
  Array.isArray(u)
  && TypeId in u
  && u[TypeId] === TypeId;

const Prototype = proto.type<Valence>({
  [TypeId]: TypeId,
  ...Pipeable.Prototype,
  ...Lineage.Prototype,
});

export const empty = <A>(): Valence<A> => make([]);

export const of = <A>(a: A): Valence<A> => make([a]);



export const make = <A>(as: Iterable<A>, lineage?: Lineage.Lineage<A>): Valence<A> => {
  const self = proto.init(Prototype, [...as] as any);
  if (lineage) {
    Lineage.set(self, lineage);
  }
  else if (isValence<A>(as)) {
    Lineage.set(self, as.__lineage()!);
  }
  return self;
};

export const vertex = <A>(vs: Valence<A>) => vs.__lineage() as A;

export const mapEach$ = <A, B>(as: Valence<A>, f: (a: A, i: number) => B): Valence<B> => {
  const bs = as.map(f);
  return make(bs, as);
};
export const mapEach = dual<<A, B>(f: (a: A, i: number) => B) => (vs: Valence<A>) => Valence<B>, typeof mapEach$>(2, mapEach$);

export const tapF = <A>(f: (a: A) => void) => (a: Valence<A>): Valence<A> => {
  a.forEach(f);
  return a;
};
