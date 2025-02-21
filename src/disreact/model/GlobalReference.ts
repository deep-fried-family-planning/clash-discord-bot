import {E} from '#src/internal/pure/effect.ts';
import {pipe} from 'effect';
import * as Cache from 'effect/Cache';
import * as F from 'effect/Function';
import * as L from 'effect/Layer';
import * as Pointer from '#src/disreact/codec/schema/entities/pointer.ts';
import * as Globals from './globals.ts';



const make = E.gen(function* () {
  const semaphore = yield* E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);

  const pointers = yield* Cache.make({
    capacity  : 100,
    timeToLive: `5 minutes`,
    lookup    : () => E.succeed(null as null | Pointer.Type),
  });

  return {
    register: (id: string) =>
      pipe(
        pointers.get(id),
        E.andThen((maybePointer) => {
          const pointer = maybePointer ?? Pointer.make(id);

          if (!maybePointer) {
            Globals.mountRoot(pointer);
          }

          return F.pipe(
            pointers.set(id, pointer),
            E.andThen(() => pointer),
          );
        }),
      ),

    withMutex: () => mutex,
    lock     : semaphore.take(1),
    unlock   : semaphore.release(1),
  };
});



export class GlobalReference extends E.Tag('DisReact.GlobalReference')<
  GlobalReference,
  E.Effect.Success<typeof make>
>() {
  static readonly singletonLayer = F.pipe(
    L.effect(this, make),
    L.memoize,
    L.unwrapEffect,
  );
}
