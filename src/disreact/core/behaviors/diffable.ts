import {INTERNAL_ERROR} from '#disreact/core/immutable/constants.ts';
import type * as Diff from '#disreact/core/immutable/diff.ts';

export const symbol = Symbol.for('disreact/Diffable');

export interface Diffable<A = any> {
  diff?: Diff.Diff<A>;
  [symbol](this: A, that: A): Diff.Diff<A>;
}

export const isDiffable = (u: unknown): u is Diffable => typeof u === 'object' && u !== null && symbol in u;

export const hasDiff = <A extends Diffable>(self: A) => !!self.diff;

export const diff = <A extends B, B>(self: A, that: B): Diff.Diff<B> => {
  if (!isDiffable(self) || !isDiffable(that)) {
    throw new Error(INTERNAL_ERROR);
  }
  return self[symbol](that);
};
