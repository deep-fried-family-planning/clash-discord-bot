import {E, g, L} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {Failure, type Ix} from '#src/internal/disreact/entity/index.ts';
import {makeDialog} from '#src/internal/disreact/entity/tx.ts';
import {Tx} from '#src/internal/disreact/entity/types/index.ts';
import type {ne} from '#src/internal/pure/types-pure.ts';
import type {EAR} from '#src/internal/types.ts';
import type {EditWebhookMessageParams, InteractionCallbackDatum} from 'dfx/types';


const emptyBroker = () => ({});


const implementation = () => E.gen(function * () {
  let id            = '',
      token         = '',
      app_id        = '',
      deferred      = false,
      res_type      = Tx.None as Tx.Defer,
      prev_deferred = false,
      prev_res_type = Tx.None as Tx.Defer;

  return {
    allocate: (rest: Ix.Rest) => {
      id            = rest.id;
      token         = rest.token;
      app_id        = rest.application_id;
      deferred      = false;
      res_type      = Tx.None;
      prev_deferred = false;
      prev_res_type = Tx.None;
    },

    setPrevDeferType: (type: Tx.Defer) => {prev_res_type = type},
    setPrevDeferred : () => {prev_deferred = true},

    delete: () => g(function * () {
      yield * DiscordApi.deleteOriginalInteractionResponse(app_id, token);
    }),

    defer: (type: Tx.Defer) => g(function * () {
      if (Tx.isNone(type)) {
        return yield * new Failure.Critical({why: 'Invalid defer type'});
      }
      if (deferred) {
        return yield * new Failure.Critical({why: 'Already deferred'});
      }
      deferred = true;
      res_type = type;
      if (!Tx.isOpenDialog(type)) {
        return yield * DiscordApi.createInteractionResponse(id, token, type);
      }
    }),

    reply: (data: ne) => g(function * () {
      if (Tx.isOpenDialog(res_type)) {
        return yield * DiscordApi.createInteractionResponse(id, token, makeDialog(data));
      }
      if (deferred) return yield * DiscordApi.editOriginalInteractionResponse(app_id, token, data as Partial<EditWebhookMessageParams>);
      return yield * DiscordApi.createInteractionResponse(id, token, {
        type: Tx.Public.type,
        data: data as InteractionCallbackDatum,
      });
    }),

    editReply: (data: ne) => g(function * () {
      if (!deferred) return yield * new Failure.Critical({why: 'Cannot edit without defer'});
      return yield * DiscordApi.editOriginalInteractionResponse(app_id, token, data as Partial<EditWebhookMessageParams>);
    }),
  };
});


export class DiscordBroker extends E.Tag('DiscordBroker')<
  DiscordBroker,
  EAR<typeof implementation>
>() {
  static makeLayer = () => L.effect(this, implementation());
}
