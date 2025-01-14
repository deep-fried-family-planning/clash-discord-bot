import {E, g, L} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {Failure, type Ix, Tx} from '#src/internal/disreact/entity/index.ts';
import {makeDialog} from '#src/internal/disreact/entity/tx.ts';
import type {EAR} from '#src/internal/types.ts';
import type {EditWebhookMessageParams, InteractionCallbackDatum, InteractionCallbackModal} from 'dfx/types';


const makeEmpty = () => ({
  id      : '',
  token   : '',
  deferred: false,
  res_type: Tx.None,
});


const implementation = () => E.gen(function * () {
  let app_id   = '',
      current  = makeEmpty(),
      previous = makeEmpty();

  const semaphore = yield * E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);

  return {
    allocate: (rest: Ix.Rest) => mutex(E.sync(() => {
      current          = makeEmpty();
      previous         = makeEmpty();
      app_id           = rest.application_id;
      current.id       = rest.id;
      current.token    = rest.token;
      current.deferred = false;
      current.res_type = Tx.None;
    })),
    getCurrent : () => mutex(E.succeed(current)),
    getPrevious: () => mutex(E.succeed(previous)),
    setPrevious: (next: typeof previous) => mutex(E.sync(() => {
      previous = next;
    })),

    delete: () => mutex(DiscordApi.deleteOriginalInteractionResponse(app_id, current.token)),

    defer: (type: Tx.Defer) => mutex(g(function * () {
      if (Tx.isNone(type)) {
        return yield * new Failure.Critical({why: 'Invalid defer'});
      }
      if (current.deferred) {
        return yield * new Failure.Critical({why: 'Already deferred'});
      }
      current.deferred = true;
      current.res_type = type;
      if (!Tx.isOpenDialog(type)) {
        yield * DiscordApi.createInteractionResponse(current.id, current.token, type);
      }
    })),

    reply: (data: Partial<EditWebhookMessageParams> | InteractionCallbackModal) => mutex(g(function * () {
      if (Tx.isOpenDialog(current.res_type)) {
        return yield * DiscordApi.createInteractionResponse(current.id, current.token, makeDialog(data));
      }

      if (current.deferred) {
        return yield * DiscordApi.editOriginalInteractionResponse(app_id, current.token, data);
      }

      yield * DiscordApi.createInteractionResponse(current.id, current.token, {
        type: Tx.Public.type,
        data: data as InteractionCallbackDatum,
      });
    })),

    editReply: (data: Partial<EditWebhookMessageParams>) => mutex(g(function * () {
      if (!current.deferred) {
        return yield * new Failure.Critical({why: 'Not deferred'});
      }
      yield * DiscordApi.editOriginalInteractionResponse(app_id, current.token, data);
    })),
  };
});


export class DiscordBroker extends E.Tag('DiscordBroker')<
  DiscordBroker,
  EAR<typeof implementation>
>() {
  static makeLayer = () => L.effect(this, implementation());
}
