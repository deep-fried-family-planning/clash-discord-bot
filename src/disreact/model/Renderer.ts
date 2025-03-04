import {RootStore} from '#src/disreact/model/globals/RootStore.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import {Data} from 'effect';
import * as Deferred from 'effect/Deferred';



type Config = Data.TaggedEnum<{
  Synthesize: {root_id: string; props?: any};
  Hydrate   : {id: string; root_id: string; hash: string};
  Switch    : {id: string; root_id: string; props?: any};
}>;

const Config = Data.taggedEnum<Config>();


export type RendererConfig = {
  id     : string;
  root_id: string;
  props? : any;
  hash?  : string;
};



const make = (config: RendererConfig) => E.gen(function* () {
  const staticModel = yield* RootStore;

  const root = staticModel.synthesizeClone(config.root_id, config.props);



  const status = yield* Deferred.make<boolean>();

  return {
    awaitAll: () => Deferred.await(status),
  };
});



export class Renderer extends E.Tag('DisReact.Renderer')<
  Renderer,
  E.Effect.Success<ReturnType<typeof make>>
>() {
  static readonly makeLayer = (id: RendererConfig) => L.effect(this, make(id));
}
