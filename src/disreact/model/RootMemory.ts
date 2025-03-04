import {RootStore} from '#src/disreact/model/globals/RootStore.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import * as Deferred from 'effect/Deferred';



const make = () => E.gen(function* () {
  const staticModel = yield* RootStore;



  const status = yield* Deferred.make<boolean>();

  return {
    awaitAll: () => Deferred.await(status),
  };
});



export class RootMemory extends E.Tag('DisReact.MemoryModel')<
  RootMemory,
  E.Effect.Success<ReturnType<typeof make>>
>() {
  static readonly makeLayer = (id: string) => L.effect(this, make());
}
