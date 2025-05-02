import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {Predicate, Data} from 'effect';

export * as Side from '#src/disreact/model/meta/side.ts';
export type Side = () => void | Promise<void> | E.Effect<void>;

export class SideEffectError extends Data.TaggedError('SideEffectError')<{
  cause: any;
}> {}

export const effect = (ef: Side) =>
  pipe(
    E.suspend(() => {
      const output = ef();

      if (Predicate.isPromise(output)) {
        return E.promise(async () => await output);
      }

      if (E.isEffect(output)) {
        return output;
      }

      return E.void;
    }),
    E.catchAllDefect((cause) => E.fail(new SideEffectError({cause}))),
  );
