import {E, pipe} from '#src/disreact/utils/re-exports.ts';

interface dispatcher {
  lock  : E.Effect<number>;
  unlock: E.Effect<number>;
}

const make = pipe(
  E.makeSemaphore(1),
  E.map((mutex) => {
    return {
      lock  : mutex.take(1),
      unlock: mutex.release(1),
    } satisfies dispatcher;
  }),
);

export class Dispatcher extends E.Service<Dispatcher>()('disreact/Dispatcher', {
  effect: E.map(E.makeSemaphore(1), (mutex) => {
    return {
      lock  : mutex.take(1),
      unlock: mutex.release(1),
    };
  }),
  accessors: true,
}) {}
