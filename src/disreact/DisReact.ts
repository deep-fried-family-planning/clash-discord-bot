import {Codec} from '#src/disreact/codec/Codec.ts';
import type {Rehydrant} from '#src/disreact/model/entity/rehydrant.ts';
import {Rehydrator} from '#src/disreact/model/Rehydrator.ts';
import {DiscordDOM} from '#src/disreact/runtime/DiscordDOM.ts';
import {DokenCache} from '#src/disreact/runtime/DokenCache.ts';
import {Methods} from 'src/disreact/runtime/methods.ts';
import * as E from 'effect/Effect';
import * as L from 'effect/Layer';
import {pipe} from 'effect/Function';

export class DisReact extends E.Service<DisReact>()('disreact/DisReact', {
  effect: E.gen(function* () {
    const layers = L.mergeAll(
      Codec.Default(),
      DiscordDOM.Default,
      DokenCache.Default({capacity: 100}),
      Rehydrator.Default({}),
    );

    return {
      registerRoot: (src: Rehydrant.Registrant, id?: string) =>
        pipe(
          Methods.registerRoot(src, id),
          E.provide(layers),
        ),

      createRoot: (id: Rehydrant.SourceId, props?: any, data?: any) =>
        pipe(
          Methods.createRoot(id, props, data),
          E.provide(layers),
        ),

      respond: (input: any) =>
        pipe(
          Methods.respond(input),
          E.provide(layers),
        ),
    };
  }),
  accessors: true,
}) {}
