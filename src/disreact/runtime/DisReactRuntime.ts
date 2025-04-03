import {Codec} from '#src/disreact/codec/Codec.ts'
import {HooksDispatcher} from '#src/disreact/model/HooksDispatcher.ts'
import {Relay} from '#src/disreact/model/Relay.ts'
import {SourceRegistry} from '#src/disreact/model/SourceRegistry.ts'
import {E, L, pipe} from '#src/disreact/codec/re-exports.ts'
import {type DisReactOptions, DsxSettings} from '#src/disreact/runtime/DisReactConfig.ts'
import {DokenMemory} from '#src/disreact/runtime/DokenMemory.ts'
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts'
import {respond} from '#src/disreact/runtime/respond.ts'
import {synthesize} from '#src/disreact/runtime/synthesize.ts'
import {DiscordConfig} from 'dfx'
import {ManagedRuntime} from 'effect'

export const makeDefaultRuntimeLayer = (
  config: {
    options     : DisReactOptions
    ixDOM?      : L.Layer<DisReactDOM>
    dokenMemory?: L.Layer<DokenMemory>
  },
) => {
  const layer = pipe(
    L.empty,
    L.provideMerge(
      L.mergeAll(
        HooksDispatcher.Default,
        Codec.Default,
        SourceRegistry.Default,
        DokenMemory.Default,
        config?.ixDOM ?? pipe(DisReactDOM.Default, L.provide(DiscordConfig.layer({token: config.options.token}))),
        config?.dokenMemory ?? DokenMemory.Default,
      ),
    ),
    L.provide(DsxSettings.configLayer(config?.options)),
  )

  return layer
}

export const makeRuntimeWithLayer = (layer: ReturnType<typeof makeDefaultRuntimeLayer>) => {
  const runtime = ManagedRuntime.make(layer)

  return {
    respond: (body: any) =>
      pipe(
        respond(body),
        E.provide([Relay.Fresh]),
        runtime.runFork,
      ),

    synthesize: (component: any, props?: any) =>
      pipe(
        synthesize(component, props),
        E.provide(Relay.Fresh),
        runtime.runFork,
      ),
  }
}
