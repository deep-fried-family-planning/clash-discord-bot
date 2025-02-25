import {E, L} from '#src/internal/pure/effect.ts';



const make = () => E.gen(function* () {
  const semaphore = yield* E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);

  return {
    mutex: () => mutex,
  };
});



export class InteractionBroker extends E.Tag('DisReact.InteractionBroker')<
  InteractionBroker,
  E.Effect.Success<ReturnType<typeof make>>
>() {
  static readonly makeLayer = () => L.effect(this, make());
}
