import type * as Inspectable from 'effect/Inspectable';
import type * as Pipeable from 'effect/Pipeable';

export interface Stack extends Pipeable.Pipeable, Inspectable.Inspectable {
  values: A[];
}

export const empty = <A>(): Stack<A> => ({values: []});
