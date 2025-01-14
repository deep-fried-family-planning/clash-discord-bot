import {E, g, L} from '#pure/effect';
import type {EA} from '#src/internal/types.ts';


const implementation = E.gen(function * () {
  const semaphore = yield * E.makeSemaphore(1);
  const mutex = semaphore.withPermits(1);

  return {
    safelyRun: () => <A, E, R>(self: E.Effect<A, E, R>) => mutex(self),
  };
});


export class MutexBroker extends E.Tag('MutexManager')<
  MutexBroker,
  EA<typeof implementation>
>() {
  static singletonLayer = L.effect(this, implementation);

  static fiberSafe = <A, E, R>(self: E.Effect<A, E, R>) => g(function * () {
    const runner = yield * MutexBroker.safelyRun();
    return yield * runner(self);
  });
}
