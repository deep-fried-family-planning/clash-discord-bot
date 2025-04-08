import {Codec} from '#src/disreact/codec/Codec.ts';
import {DokenMemory} from '#src/disreact/codec/DokenMemory.ts';
import {HooksDispatcher} from '#src/disreact/model/HooksDispatcher.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {DisReactConfig} from '#src/disreact/runtime/DisReactConfig.ts';
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts';
import {E, flow, L, pipe} from '#src/disreact/utils/re-exports.ts';
import {Fiber, ManagedRuntime} from 'effect';
import {Methods} from './methods';

export * as Runtime from '#src/disreact/runtime/runtime.ts';
export type Runtime = ReturnType<typeof makeRuntime>;

export const makeGlobalModelLayer = () =>
  L.mergeAll(
    HooksDispatcher.Default,
    Codec.Default,
    Registry.Default,
    Relay.Default,
  );

export const makeGlobalRuntimeLayer = (
  config?: {
    config?: DisReactConfig.Input;
    dom?   : L.Layer<DisReactDOM>;
    memory?: L.Layer<DokenMemory, never, DisReactConfig>;
  },
) =>
  pipe(
    L.mergeAll(
      HooksDispatcher.Default,
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

export const makeRuntime = (layer: GlobalRuntimeLayer) => {
  const runtime = ManagedRuntime.make(layer);

  const synthesize = flow(
    Methods.synthesize,
    runtime.runFork,
    Fiber.join,
  );

  const respond = flow(
    Methods.respond,
    E.scoped,
    E.provide(Relay.Fresh),
    runtime.runFork,
    Fiber.join,
  );

  return {
    synthesize,
    respond,
  };
};
