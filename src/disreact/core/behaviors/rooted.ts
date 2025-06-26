import * as proto from '#src/disreact/core/primitives/proto.ts';
import {globalValue} from 'effect/GlobalValue';

export const symbol = Symbol.for('disreact/originates');

export interface Rooted<A = any> {
  [symbol](): A;
}

export const isRooted = <A>(u: unknown): u is Rooted<A> => typeof u === 'object' && u !== null && symbol in u;

export const rooted = <A, B extends Rooted<A>>(self: B): A => {
  if (!isRooted(self)) {
    throw new Error('Not Originates');
  }
  return self[symbol]();
};

const rs = globalValue(symbol, () => new WeakMap());

export const Prototype = proto.type<Rooted>({
  [symbol]() {
    return rs.get(this);
  },
});
