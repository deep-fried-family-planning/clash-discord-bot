import {E, L} from '#src/internal/pure/effect.ts';



const make = E.gen(function* () {
  const semaphore = yield* E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);

  return {
    mutex: () => mutex,
  };
});



export class DisReactFrame extends E.Tag('DisReact.Frame')<
  DisReactFrame,
  E.Effect.Success<typeof make>
>() {
  static readonly makeLayer = () => L.effect(this, make);
}
