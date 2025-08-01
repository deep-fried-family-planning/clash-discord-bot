import {Codec} from '#disreact/codec/a/codec/Codec.ts';
import type {Envelope} from '#disreact/codec/a/adaptor/envelope.ts';
import {Rehydrator, type RehydratorConfig} from '#disreact/codec/a/adaptor/Rehydrator.ts';
import {DiscordDOM} from '#disreact/adaptor-discord/service/DiscordDOM.ts';
import {DokenCache, type DokenCacheConfig} from '#disreact/adaptor-discord/service/DokenCache.ts';
import * as Methods from '#disreact/codec/a/methods.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';

export type DisReactConfig = {
  rehydrator: RehydratorConfig;
  cache     : DokenCacheConfig;
};

export class DisReact extends E.Service<DisReact>()('disreact', {
  effect: E.fnUntraced(function* (config: DisReactConfig) {
    const layers = L.mergeAll(
      Codec.Default(),
      DiscordDOM.Default,
      Rehydrator.Default(config.rehydrator),
      DokenCache.Default(config.cache),
    );

    return {
      registerRoot: (src: Envelope.Registrant, id?: string) =>
        pipe(
          Methods.registerRoot(src, id),
          E.provide(layers),
        ),

      createRoot: (id: Envelope.SourceId, props?: any, data?: any) =>
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
