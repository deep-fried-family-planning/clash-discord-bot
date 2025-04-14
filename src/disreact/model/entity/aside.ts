import {E} from '#src/disreact/utils/re-exports.ts';
import {Predicate} from 'effect';

export const TypeId = Symbol('disreact/Side');

export * as Aside from '#src/disreact/model/entity/aside.ts';
export type Aside = () => void | Promise<void> | E.Effect<void>;

export const apply = (ef: Aside) => E.suspend(() => {
  const output = ef();

  if (Predicate.isPromise(output)) {
    return E.tryPromise(async () => await output);
  }

  if (E.isEffect(output)) {
    return output;
  }

  return E.void;
});
