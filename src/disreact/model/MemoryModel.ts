import {StaticModel} from '#src/disreact/model/StaticModel.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import * as Deferred from 'effect/Deferred';



const make = () => E.gen(function* () {
  const staticModel = yield* StaticModel;



  const status = yield* Deferred.make<boolean>();

  return {
    awaitAll: () => Deferred.await(status),
  };
});



export class MemoryModel extends E.Tag('DisReact.MemoryModel')<
  MemoryModel,
  E.Effect.Success<ReturnType<typeof make>>
>() {
  static readonly makeLayer = (id: string) => L.effect(this, make());
}
