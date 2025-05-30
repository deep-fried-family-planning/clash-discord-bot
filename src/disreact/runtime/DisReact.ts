import {Codec} from '#src/disreact/codec/Codec.ts';
import {Dispatcher} from '#src/disreact/model/Dispatcher.ts';
import type {Source} from '#src/disreact/model/meta/source.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {Sources} from '#src/disreact/model/Sources.ts';
import {DiscordDOM} from '#src/disreact/runtime/DiscordDOM.ts';
import {DokenMemory} from '#src/disreact/runtime/DokenMemory.ts';
import {Methods} from './methods';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import {pipe} from 'effect/Function';

export class DisReact extends Effect.Service<DisReact>()('disreact/DisReact', {
  sync: () => {
    const layers = pipe(
      Layer.mergeAll(
        Sources.Default,
        Dispatcher.Default,
        Codec.Default,
        Relay.Default,
        DiscordDOM.Default,
        DokenMemory.Default,
      ),
    );

    return {
      registerRoot: (src: Source.Registrant, id?: string) =>
        pipe(
          Methods.registerRoot(src, id),
          Effect.provide(layers),
        ),

      createRoot: (id: Source.Key, props?: any) =>
        pipe(
          Methods.createRoot(id, props),
          Effect.provide(layers),
        ),

      respond: (input: any) =>
        pipe(
          Methods.respond(input),
          Effect.provide(layers),
          Effect.provide(Relay.Fresh),
        ),
    };
  },
  accessors: true,
}) {}
