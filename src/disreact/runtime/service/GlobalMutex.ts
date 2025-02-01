import {E, L, pipe} from '#src/internal/pure/effect.ts';
import type {EA} from '#src/internal/types.ts';

const make = E.gen(function * () {
  const semaphore = yield * E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);

  return {youShallNotPass: () => mutex};
});

export class GlobalMutex extends E.Tag('DisReact.GlobalMutex')<
  GlobalMutex,
  EA<typeof make>
>() {
  static singleton = L.effect(this, make);
  static limit     = <A, E, R>(self: E.Effect<A, E, R>) => pipe(
    GlobalMutex.youShallNotPass(),
    E.flatMap((permit) => permit(self)),
    E.provide(GlobalMutex.singleton),
  );
}
