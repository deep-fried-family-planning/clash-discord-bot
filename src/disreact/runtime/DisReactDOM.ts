import {E, L, pipe} from '#src/disreact/utils/re-exports.ts';
import {RDT} from '#src/internal/pure/effect.ts';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordREST, DiscordRESTMemoryLive} from 'dfx';
import {InteractionCallbackType} from 'dfx/types';

type Token = RDT.Redacted<string>;

export class DisReactDOM extends E.Service<DisReactDOM>()('disreact/IxDOM', {
  effect: E.map(DiscordREST, (api) => {
    const discard = (id: string, token: Token, body: {type: 7}) =>
      pipe(
        api.createInteractionResponse(id, RDT.value(token), body),
        E.asVoid,
      );

    const dismount = (app: string, token: Token) =>
      pipe(
        api.deleteOriginalInteractionResponse(app, RDT.value(token)),
        E.asVoid,
      );

    const defer = (id: string, token: Token, body: any) =>
      pipe(
        api.createInteractionResponse(id, RDT.value(token), body),
        E.asVoid,
      );

    const create = (id: string, token: Token, body: any) =>
      pipe(
        api.createInteractionResponse(id, RDT.value(token), body),
        E.asVoid,
      );

    const reply = (app: string, token: Token, body: any) =>
      pipe(
        api.editOriginalInteractionResponse(app, RDT.value(token), body),
        E.asVoid,
      );

    return {
      discard,
      dismount,
      defer,
      create,
      reply,
    };
  }),
  dependencies: [
    pipe(
      DiscordRESTMemoryLive,
      L.provide(NodeHttpClient.layerUndici),
    ),
  ],
  accessors: true,
}) {}
