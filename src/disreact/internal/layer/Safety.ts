import {E, L, pipe} from '#src/internal/pure/effect.ts';
import type {EA} from '#src/internal/types.ts';



const make = E.gen(function * () {
  const semaphore = yield * E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);

  return {
    lock           : () => semaphore.take(1),
    unlock         : () => semaphore.release(1),
    youShallNotPass: () => mutex,
  };
});



export class Safety extends E.Tag('DisReact.Safety')<
  Safety,
  EA<typeof make>
>() {
  static globalLayer = pipe(
    L.effect(this, make),
    L.memoize,
    L.unwrapEffect,
    L.extendScope,
  );

  static limit = <A, E, R>(self: E.Effect<A, E, R>) => pipe(
    Safety.youShallNotPass(),
    E.flatMap((permit) => permit(self)),
    E.provide(Safety.globalLayer),
  );
}
