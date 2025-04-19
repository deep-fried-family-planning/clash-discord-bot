import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {Predicate} from 'effect';

export * as Side from '#src/disreact/model/meta/side.ts';
export type Side = () => void | Promise<void> | E.Effect<void>;

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
    E.catchAllDefect((e) => E.fail(e as Error)),
  );
