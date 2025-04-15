import {E} from '#src/disreact/utils/re-exports.ts';
import {Predicate, Data} from 'effect';

export * as Side from '#src/disreact/model/entity/side.ts';
export type Side = () => void | Promise<void> | E.Effect<void>;

export class SideEffectDefect extends Data.TaggedError('disreact/SideEffectDefect')<{
  cause: unknown;
}> {}

export const apply = (ef: Side) => E.suspend(() => {
  const output = ef();

  if (Predicate.isPromise(output)) {
    return E.promise(async () => await output);
  }

  if (E.isEffect(output)) {
    return output;
  }

  return E.void;
});
