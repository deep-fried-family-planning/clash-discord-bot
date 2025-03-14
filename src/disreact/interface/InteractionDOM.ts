import {E, L, RDT} from '#src/internal/pure/effect.ts';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordConfig, DiscordREST, DiscordRESTMemoryLive} from 'dfx';
import type {Tx} from '../codec/wire';



export class DiscordDOM extends E.Service<DiscordDOM>()('disreact/DiscordDOM', {
  accessors   : true,
  effect      : E.suspend(() => makeWithDfx),
  dependencies: [L.suspend(() => DfxLive)],
}) {}

const DfxLive = DiscordRESTMemoryLive.pipe(
  L.provide(NodeHttpClient.layerUndici),
  L.provide(DiscordConfig.layer({
    token: RDT.make(process.env.DFFP_DISCORD_BOT_TOKEN),
  })),
);

const makeWithDfx = E.gen(function* () {
  const api = yield* DiscordREST;

  const discard = (tx: Tx.Discard) =>
    api.createInteractionResponse(tx.id, tx.token, tx.body);

  const defer = (tx: Tx.Defer) =>
    api.createInteractionResponse(tx.id, tx.token, tx.body);

  const create = (tx: Tx.Create) =>
    api.createInteractionResponse(tx.id, tx.token, tx.body as any);

  const reply = (tx: Tx.Reply) =>
    api.editOriginalInteractionResponse(tx.app, tx.token, tx.body as any);

  const update = (tx: Tx.Update) =>
    api.editOriginalInteractionResponse(tx.app, tx.token, tx.body as any);

  const dismount = (tx: Tx.Dismount) =>
    api.deleteOriginalInteractionResponse(tx.app, tx.token);

  return {
    discard,
    defer,
    create,
    reply,
    update,
    dismount,
  };
});


// interface IDiscordDOM {
//   discard : (doken: Doken.T) => E.Effect<void, DiscordRESTError>;
//   defer   : (doken: Doken.T) => E.Effect<void, DiscordRESTError>;
//   create  : (doken: Doken.T, encoded: any) => E.Effect<void, DiscordRESTError>;
//   reply   : (app_id: string, doken: Doken.T, encoded: any) => E.Effect<void, DiscordRESTError>;
//   update  : (app_id: string, doken: Doken.T, encoded: any) => E.Effect<void, DiscordRESTError>;
//   dismount: (app_id: string, doken: Doken.T) => E.Effect<void, DiscordRESTError>;
// }
