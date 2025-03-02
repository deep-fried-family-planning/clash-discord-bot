import {E, L, LG, LL, RDT} from '#src/internal/pure/effect.ts';
import {DiscordREST} from 'dfx';
import type {DiscordRESTError} from 'dfx/DiscordREST';
import {pipe} from 'effect';
import type * as Doken from '#src/disreact/codec/rest/doken-old.ts';
import * as Rest from '#src/disreact/codec/rest/rest.ts';



export class DiscordDOM extends E.Tag('DisReact.DiscordDOM')<
  DiscordDOM,
  {
    discard : (doken: Doken.Type) => E.Effect<void, DiscordRESTError>;
    defer   : (doken: Doken.Type) => E.Effect<void, DiscordRESTError>;
    create  : (doken: Doken.Type, encoded: any) => E.Effect<void, DiscordRESTError>;
    reply   : (app_id: string, doken: Doken.Type, encoded: any) => E.Effect<void, DiscordRESTError>;
    update  : (app_id: string, doken: Doken.Type, encoded: any) => E.Effect<void, DiscordRESTError>;
    dismount: (app_id: string, doken: Doken.Type) => E.Effect<void, DiscordRESTError>;
  }
>() {
  static readonly defaultLayer = L.suspend(() => makeDfx);
}



const makeDfx = L.effect(DiscordDOM, E.gen(function* () {
  const REST = yield* DiscordREST;

  return {
    discard: (doken) =>
      pipe(
        REST.createInteractionResponse(
          doken.id,
          RDT.value(doken.token!),
          {type: Rest.DEFER_UPDATE},
        ),
        E.provide(LG.minimumLogLevel(LL.Info)),
      ),

    defer: (doken) =>
      pipe(
        REST.createInteractionResponse(
          doken.id,
          RDT.value(doken.token!),
          doken.ephemeral
            ? {type: doken.type, data: {flags: Rest.EPHEMERAL}}
            : {type: doken.type},
        ),
        E.provide(LG.minimumLogLevel(LL.Info)),
      ),

    create: (doken, data) =>
      pipe(
        REST.createInteractionResponse(
          doken.id,
          RDT.value(doken.token!),
          {type: doken.type, data},
        ),
        E.provide(LG.minimumLogLevel(LL.Info)),
      ),

    reply: (app_id, doken, data) =>
      pipe(
        REST.editOriginalInteractionResponse(
          app_id,
          RDT.value(doken.token!),
          data,
        ),
        E.provide(LG.minimumLogLevel(LL.Info)),
      ),

    update: (app_id, doken, data) =>
      pipe(
        REST.editOriginalInteractionResponse(
          app_id,
          RDT.value(doken.token!),
          data,
        ),
        E.provide(LG.minimumLogLevel(LL.Info)),
      ),

    dismount: (app_id, doken) =>
      pipe(
        REST.deleteOriginalInteractionResponse(
          app_id,
          RDT.value(doken.token!),
        ),
        E.provide(LG.minimumLogLevel(LL.Info)),
      ),
  };
}));
