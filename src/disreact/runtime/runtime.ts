import {Codec} from '#src/disreact/codec/Codec.ts';
import {Rehydrator, type RehydratorConfig} from '#src/disreact/model/Rehydrator.ts';
import {DiscordDOM} from '#src/disreact/runtime/DiscordDOM.ts';
import {DokenCache} from '#src/disreact/runtime/DokenCache.ts';
import * as Methods from '#src/disreact/runtime/methods.ts';
import * as E from 'effect/Effect';
import {flow, pipe} from 'effect/Function';
import * as L from 'effect/Layer';

export const makeGlobalRuntimeLayer = (
  config?: {
    rehydrator?: RehydratorConfig;
    capacity?  : number;
    dom?       : L.Layer<DiscordDOM>;
    memory?    : L.Layer<DokenCache>;
  },
) => {
  return L.mergeAll(
    Codec.Default(),
    Rehydrator.Default(config?.rehydrator),
    config?.dom ?? DiscordDOM.Default,
    config?.memory ?? DokenCache.Default({capacity: config?.capacity ?? 100}),
  );
};

export type GlobalRuntimeLayer = ReturnType<typeof makeGlobalRuntimeLayer>;

export const makeRuntime = (layer: GlobalRuntimeLayer) => {
  const synthesize = flow(
    Methods.createRoot,
    E.provide(layer),
  );

  const respond = (input: any) =>
    pipe(
      Methods.respond(input),
      E.provide(layer),
    );

  return {
    synthesize,
    respond,
  };
};
