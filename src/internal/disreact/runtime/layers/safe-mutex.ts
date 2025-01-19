import {E, g, L, pipe} from '#pure/effect';
import type {EA} from '#src/internal/types.ts';


const safeMutex = g(function * () {
  const semaphore     = yield * E.makeSemaphore(1);
  const mutex = semaphore.withPermits(1);

  return {
    youShallNotPass: () => mutex,
  };
});


export class SafeMutex extends E.Tag('SafeMutex')<SafeMutex, EA<typeof safeMutex>>() {
  static singleton = L.effect(this, safeMutex);

  static limit = <A, E, R>(self: E.Effect<A, E, R>) => pipe(
    SafeMutex.youShallNotPass(),
    E.tap(E.logTrace('SafeMutex: locked')),
    E.flatMap((permit) => permit(self)),
    E.tap(E.logTrace('SafeMutex: unlocked')),
    E.provide(SafeMutex.singleton),
  );
}
