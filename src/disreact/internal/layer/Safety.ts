import {E, L, pipe} from '#src/internal/pure/effect.ts';
import type {EA} from '#src/internal/types.ts';



const make = E.gen(function * () {
  const semaphore = yield * E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);

  return {
    youShallNotPass: () => mutex,
  };
});



export class Safety extends E.Tag('DisReact.Safety')<
  Safety,
  EA<typeof make>
>() {
  static Live = L.effect(this, make);

  static limit = <A, E, R>(self: E.Effect<A, E, R>) => pipe(
    Safety.youShallNotPass(),
    E.flatMap((permit) => permit(self)),
    E.provide(Safety.Live),
  );
}
