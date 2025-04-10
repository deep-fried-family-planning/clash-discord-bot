import {E} from '#src/disreact/utils/re-exports.ts';
import {Predicate} from 'effect';

export const TypeId = Symbol('disreact/Side');

export * as Side from '#src/disreact/model/entity/side.ts';
export type Side = () => void | Promise<void> | E.Effect<void>;

export const apply = (ef: Side) => E.suspend(() => {
  const output = ef();

  if (Predicate.isPromise(output)) {
    return E.tryPromise(async () => await output);
  }

  if (E.isEffect(output)) {
    return output;
  }

  return E.void;
});

export type Queue = Side[];
