import {E, pipe} from '#src/disreact/utils/re-exports.ts';

export class Dispatcher extends E.Service<Dispatcher>()('disreact/Dispatcher', {
  effect: pipe(
    E.all({
      mutex: E.makeSemaphore(1),
    }),
    E.map(({mutex}) =>
      ({
        lock  : mutex.take(1),
        unlock: mutex.release(1),
      }),
    ),
  ),
  accessors: true,
}) {}
