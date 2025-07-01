import * as Lineage from '#disreact/core/behaviors/lineage.ts';
import * as proto from '#disreact/core/behaviors/proto.ts';
import * as Equal from 'effect/Equal';
import {dual} from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';

const TypeId = Symbol.for('disreact/valence');

export const NONE = 0,
             LONE = 1,
             MANY = 2;

export interface Base<A> extends Pipeable.Pipeable,
  Inspectable.Inspectable,
  Hash.Hash,
  Equal.Equal,
  Lineage.Lineage<A>
{
  [TypeId]: typeof TypeId;
  _tag    : any;
}

export interface None<A> extends Base<A> {
  _tag: typeof NONE;
}

export interface Lone<A> extends Base<A> {
  _tag: typeof LONE;
  lone: A;
}

export interface Many<A> extends Base<A> {
  _tag: typeof MANY;
  list: A[];
}

export type Valence<A> = | None<A>
                         | Lone<A>
                         | Many<A>;

export const isValence = <A>(u: unknown): u is Valence<A> => typeof u === 'object' && u !== null && TypeId in u;

export const isNone = <A>(u: Valence<A>): u is None<A> => u._tag === NONE;

export const isLone = <A>(u: Valence<A>): u is Lone<A> => u._tag === LONE;

export const isMany = <A>(u: Valence<A>): u is Many<A> => u._tag === MANY;

const BasePrototype = proto.type<Base<any>>({
  [TypeId]: TypeId,
  ...Pipeable.Prototype,
  ...Lineage.Prototype,
  ...Inspectable.BaseProto,
});

const NonePrototype = proto.type<None<any>>({
  ...BasePrototype,
  _tag: NONE,
  [Hash.symbol]() {
    return 1;
  },
  [Equal.symbol](that: None<any>) {
    if (that._tag === NONE) {
      return true;
    }
    return false;
  },
});

const LonePrototype = proto.type<Lone<any>>({
  ...BasePrototype,
  _tag: LONE,
  [Hash.symbol]() {
    return Hash.structure(this.lone);
  },
  [Equal.symbol](that: Lone<any>) {
    if (that._tag !== LONE) {
      return false;
    }
    return Equal.equals(this.lone, that.lone);
  },
});

const ManyPrototype = proto.type<Many<any>>({
  ...BasePrototype,
  _tag: MANY,
  [Hash.symbol]() {
    return Hash.array(this.list!);
  },
  [Equal.symbol](that: Many<any>) {
    if (that._tag !== MANY) {
      return false;
    }
    if (this.list!.length !== that.list.length) {
      return false;
    }
    for (let i = 0; i < this.list!.length; i++) {
      if (!Equal.equals(this.list![i], that.list[i])) {
        return false;
      }
    }
    return true;
  },
});

export const none = <A>(): None<A> => NonePrototype;

export const lone = <A>(a: A): Lone<A> =>
  proto.init(LonePrototype, {
    lone: a,
  });

export const many = <A>(as: Iterable<A>): Many<A> =>
  proto.init(ManyPrototype, {
    list: [...as],
  });

export const map__ = <A, B>(self: Valence<A>, f: (a: A, i: number) => B): Valence<B> => {
  switch (self._tag) {
    case NONE: {
      return none<A>();
    }
    case LONE: {
      const b = f(self.lone, 0);
      return lone(b);
    }
    case MANY: {
      const bs = self.list.map(f);
      return many(bs);
    }
  }
};
export const map = dual<<A, B>(f: (a: A, i: number) => B) => (self: Valence<A>) => Valence<B>, typeof map__>(2, map__);
