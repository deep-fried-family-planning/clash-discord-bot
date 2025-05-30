import {Codec} from '#src/disreact/codec/Codec.ts';
import {Rehydrator, type RehydratorConfig} from '#src/disreact/model/Rehydrator.ts';
import {DiscordDOM} from '#src/disreact/runtime/DiscordDOM.ts';
import {DokenCache} from '#src/disreact/runtime/DokenCache.ts';
import * as E from 'effect/Effect';
import {flow, pipe} from 'effect/Function';
import * as L from 'effect/Layer';
import {Methods} from './methods';

export * as Runtime from '#src/disreact/runtime/runtime.ts';
export type Runtime = ReturnType<typeof makeRuntime>;

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
    Rehydrator.Default(config?.rehydrator ?? {}),
    config?.dom ?? DiscordDOM.Default,
    config?.memory ?? DokenCache.Default({capacity: config?.capacity ?? 100}),
  );
};

export type GlobalRuntimeLayer = ReturnType<typeof makeGlobalRuntimeLayer>;

export const makeRuntime = (layer: GlobalRuntimeLayer) => {
  const synthesize = flow(
    Methods.createRoot,
    E.provide(layer),
    E.tapDefect(E.logFatal),
  );

  const respond = (input: any) =>
    pipe(
      Methods.respond(input),
      E.provide(layer),
      E.tapDefect(E.logFatal),
    );

  return {
    synthesize,
    respond,
  };
};
