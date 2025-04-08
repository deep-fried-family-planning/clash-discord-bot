import {Codec} from '#src/disreact/codec/Codec.ts';
import {HooksDispatcher} from '#src/disreact/model/HooksDispatcher.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {E, L, pipe} from '#src/disreact/utils/re-exports.ts';
import {type DisReactOptions, DisReactConfig} from '#src/disreact/runtime/DisReactConfig.ts';
import {DokenMemory} from '#src/disreact/codec/DokenMemory.ts';
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts';
import {DiscordConfig} from 'dfx';
import {ManagedRuntime} from 'effect';
import { Methods } from './methods';

export const makeDefaultRuntimeLayer = (
  config: {
    options     : DisReactOptions;
    ixDOM?      : L.Layer<DisReactDOM>;
    dokenMemory?: L.Layer<DokenMemory>;
  },
) => {
  const layer = pipe(
    L.empty,
    L.provideMerge(
      L.mergeAll(
        HooksDispatcher.Default,
        Codec.Default,
        Registry.Default,
        DokenMemory.Default,
        config?.ixDOM ?? pipe(DisReactDOM.Default, L.provide(DiscordConfig.layer({token: config.options.token}))),
        config?.dokenMemory ?? DokenMemory.Default,
      ),
    ),
    L.provide(DisReactConfig.configLayer(config?.options)),
  );

  return layer;
};

export const makeRuntimeWithLayer = (layer: ReturnType<typeof makeDefaultRuntimeLayer>) => {
  const runtime = ManagedRuntime.make(layer);

  return {
    respond: (body: any) =>
      pipe(
        Methods.respond(body),
        E.scoped,
        E.provide([Relay.Fresh]),
        runtime.runFork,
      ),

    synthesize: (component: any, props?: any) =>
      pipe(
        Methods.synthesize(component, props),
        E.provide(Relay.Fresh),
        runtime.runFork,
      ),
  };
};
