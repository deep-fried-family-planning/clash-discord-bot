import {Codec} from '#src/disreact/codec/Codec.ts';
import {Dispatcher} from '#src/disreact/model/Dispatcher.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {DokenManager} from '#src/disreact/utils/DokenManager.ts';
import {DisReactConfig} from '#src/disreact/utils/DisReactConfig.ts';
import {DisReactDOM} from '#src/disreact/utils/DisReactDOM.ts';
import {DokenMemory} from '#src/disreact/utils/DokenMemory.ts';
import {E, flow, L, pipe} from '#src/disreact/utils/re-exports.ts';
import {Fiber, ManagedRuntime, Runtime as Run} from 'effect';
import {Methods} from './methods';

export * as Runtime from '#src/disreact/runtime/runtime.ts';
export type Runtime = ReturnType<typeof makeRuntime>;

export const makeGlobalRuntimeLayer = (
  config?: {
    config?: DisReactConfig.Input;
    dom?   : L.Layer<DisReactDOM>;
    memory?: L.Layer<DokenMemory, never, DisReactConfig>;
  },
) =>
  pipe(
    L.mergeAll(
      Dispatcher.Default,
      Codec.Default,
      Registry.Default,
      Relay.Default,
      config?.dom ?? DisReactDOM.Default,
      config?.memory ?? DokenMemory.Default,
    ),
    L.provideMerge(
      config?.config
        ? DisReactConfig.configLayer(config.config)
        : DisReactConfig.Default,
    ),
  );

export type GlobalRuntimeLayer = ReturnType<typeof makeGlobalRuntimeLayer>;

export const makePromise = (layer: GlobalRuntimeLayer) => {
  const runtime = ManagedRuntime.make(layer);
};

export const makeRuntime = (layer: GlobalRuntimeLayer) => {
  const synthesize = flow(
    Methods.synthesize,
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
