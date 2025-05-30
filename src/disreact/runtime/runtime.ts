import {Codec} from '#src/disreact/codec/Codec.ts';
import {Dispatcher} from '#src/disreact/model/Dispatcher.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {Sources} from '#src/disreact/model/Sources.ts';
import {DisReactConfig} from '#src/disreact/model/DisReactConfig.ts';
import {DiscordDOM} from '#src/disreact/runtime/DiscordDOM.ts';
import {DokenMemory} from '#src/disreact/runtime/DokenMemory.ts';
import * as E from 'effect/Effect';
import {flow, pipe} from 'effect/Function';
import * as L from 'effect/Layer';
import {Methods} from './methods';

export * as Runtime from '#src/disreact/runtime/runtime.ts';
export type Runtime = ReturnType<typeof makeRuntime>;

export const makeGlobalRuntimeLayer = (
  config?: {
    config?: DisReactConfig.Input;
    dom?   : L.Layer<DiscordDOM>;
    memory?: L.Layer<DokenMemory, never, DisReactConfig>;
  },
) =>
  pipe(
    L.mergeAll(
      Dispatcher.Default,
      Codec.Default,
      Sources.Default,
      Relay.Default,
      config?.dom ?? DiscordDOM.Default,
      config?.memory ?? DokenMemory.Default,
    ),
    L.provideMerge(
      config?.config
        ? DisReactConfig.configLayer(config.config)
        : DisReactConfig.Default,
    ),
  );

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
      E.provide(Relay.Fresh),
    );

  return {
    synthesize,
    respond,
  };
};
