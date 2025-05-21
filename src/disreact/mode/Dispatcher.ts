import * as El from '#src/disreact/mode/entity/el.ts';
import * as FC from '#src/disreact/mode/entity/fc.ts';
import * as Fibril from '#src/disreact/mode/entity/polymer.ts';
import * as Hook from '#src/disreact/mode/hook.ts';
import type {Rehydrant} from '#src/disreact/mode/entity/rehydrant.ts';
import * as Side from '#src/disreact/mode/state/side.ts';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

export class DispatcherError extends Data.TaggedError('DispatcherError')<{
  cause: Error;
}> {}

export class Dispatcher extends E.Service<Dispatcher>()('disreact/Dispatcher', {
  effect: E.gen(function* () {
    const mutex = yield* E.makeSemaphore(1);

    const render = (root: Rehydrant.Rehydrant, fn: El.Fn) => {
      const fibril = Fibril.get(fn);

      return pipe(
        mutex.take(1),
        E.flatMap(() =>
          pipe(
            E.sync(() => Hook.setContext(root, fn, fibril)),
            E.flatMap(() => FC.render(fn.type, fn.props)),
          ),
        ),
        E.flatMap((rendered) =>
          pipe(
            E.sync(() => {
              Hook.resetContext();
              Fibril.commit(fibril);
            }),
            E.flatMap(() => mutex.release(1)),
            E.as(El.normalize(fn, rendered)),
          ),
        ),
        E.catchAllDefect((d) =>
          pipe(
            E.sync(() => {
              Hook.resetContext();
              Fibril.commit(fibril);
            }),
            E.flatMap(() => mutex.release(1)),
            E.flatMap(() => new DispatcherError({cause: d as Error})),
          ),
        ),
      );
    };

    return {
      render: render,
    };
  }),
  accessors: true,
}) {}
