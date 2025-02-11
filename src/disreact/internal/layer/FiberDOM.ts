import {E, L, pipe} from '#src/internal/pure/effect.ts';



const make = pipe(E.makeSemaphore(1), E.map((semaphore) => {
  const mutex = semaphore.withPermits(1);

  return {
    mutex: () => <A, E, R>(self: E.Effect<A, E, R>): E.Effect<A, E, R> => mutex(self),
    mut  : semaphore.withPermits(1),
  };
}));



export class FiberDOM extends E.Tag('DisReact.FiberDOM')<
  FiberDOM,
  E.Effect.Success<typeof make>
>() {
  static makeLayer = () => L.effect(this, make);
}
