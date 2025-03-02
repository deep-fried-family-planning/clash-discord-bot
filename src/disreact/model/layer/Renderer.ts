import {E, L} from '#src/internal/pure/effect.ts';
import * as Deferred from 'effect/Deferred';
import * as Pointer from '#src/disreact/codec/dsx/fiber/fiber-pointer.ts';



export type RendererConfig = {
  id   : string;
  hash?: string;
};



const make = (id: string) => E.gen(function* () {
  const pointer = Pointer.make(id);
  const status = yield* Deferred.make<boolean>();

  return {
    awaitAll: () => Deferred.await(status),
  };
});



export class Renderer extends E.Tag('DisReact.Renderer')<
  Renderer,
  E.Effect.Success<ReturnType<typeof make>>
>() {
  static readonly makeLayer = (id: string) => L.effect(this, make(id));
}
