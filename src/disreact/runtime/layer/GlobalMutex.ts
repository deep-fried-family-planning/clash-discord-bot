import {E, L, pipe} from '#src/internal/pure/effect.ts';
import type {EA} from '#src/internal/types.ts';



const safeMutex = E.gen(function * () {
  const semaphore = yield * E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);

  return {
    youShallNotPass: () => mutex,
  };
});


export class GlobalMutex extends E.Tag('DisReact.GlobalMutex')<
  GlobalMutex,
  EA<typeof safeMutex>
>() {
  static singleton = L.effect(this, pipe(
    safeMutex,
    E.cached,
    E.flatten,
  ));

  static limit = <A, E, R>(self: E.Effect<A, E, R>) => pipe(
    GlobalMutex.youShallNotPass(),
    E.flatMap((permit) => permit(self)),
    E.provide(GlobalMutex.singleton),
  );
}
