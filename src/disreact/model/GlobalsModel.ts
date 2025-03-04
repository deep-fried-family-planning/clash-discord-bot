import {E, L} from '#src/internal/pure/effect.ts';
import {pipe} from 'effect';



const make = E.gen(function* () {
  const semaphore = yield* E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);

  return {
    mutex: () => mutex,
  };
});



export class GlobalsModel extends E.Tag('DisReact.GlobalReference')<
  GlobalsModel,
  E.Effect.Success<typeof make>
>() {
  static readonly singletonLayer = pipe(
    L.effect(this, make),
    L.memoize,
    L.unwrapEffect,
  );
}
