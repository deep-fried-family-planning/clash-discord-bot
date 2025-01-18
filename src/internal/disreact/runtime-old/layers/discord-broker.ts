import {TxFlag} from '#pure/dfx';
import {DT, E, g, L, pipe} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {Failure, type Ix, Tx} from '#src/internal/disreact/entity/index.ts';
import {makeDialog} from '#src/internal/disreact/entity/tx.ts';
import {isStillActiveTime} from '#src/internal/disreact/runtime-old/broker/active.ts';
import type {num, str} from '#src/internal/pure/types-pure.ts';
import type {EAR} from '#src/internal/types.ts';
import type {EditWebhookMessageParams, InteractionCallbackDatum, InteractionCallbackModal} from 'dfx/types';


const makeEmpty = () => ({
  id       : '',
  token    : '',
  ephemeral: false,
  deferred : false,
  res_type : Tx.None,
  active   : 0,
});


export const FIFTEEN_MINUTES_IN_SECONDS  = 900000;
export const FOURTEEN_MINUTES_IN_SECONDS = 840000;
export const THREE_SECONDS               = 3000;


const implementation = () => E.gen(function * () {
  let app_id              = '',
      curr                = makeEmpty(),
      prev                = makeEmpty(),
      shouldDeferAgain    = false,
      previousStillActive = false;

  const semaphore = yield * E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);

  return {
    allocate: (rest: Ix.Rest, lastActive?: num, lastToken?: str) => mutex(E.sync(() => {
      curr             = makeEmpty();
      prev             = makeEmpty();
      app_id           = rest.application_id;
      curr.id          = rest.id;
      curr.token       = rest.token;
      curr.active      = THREE_SECONDS;
      curr.deferred    = false;
      curr.res_type    = Tx.None;
      curr.ephemeral   = rest.message?.flags === TxFlag.EPHEMERAL;
      shouldDeferAgain = true;

      if (lastActive && lastToken) {
        prev.active   = lastActive;
        prev.token    = lastToken;
        prev.deferred = true;
        if (isStillActiveTime(prev.active)) {
          shouldDeferAgain    = false;
          previousStillActive = true;
        }
      }
    })),
    getCurrent : () => mutex(E.succeed(curr)),
    getPrevious: () => mutex(E.succeed(prev)),
    setPrevious: (next: typeof prev) => mutex(E.sync(() => {
      prev = next;
    })),

    getActive: () => mutex(E.succeed(curr.active)),
    setActive: (next: number) => mutex(E.sync(() => {
      curr.active = next;
    })),

    delete: (token?: str) => mutex(g(function * () {
      yield * E.logDebug(`[delete]`);
      curr.res_type = Tx.Close;
      curr.deferred = true;


      if (!token) {
        return yield * E.fork(DiscordApi.deleteOriginalInteractionResponse(app_id, curr.token));
      }

      return yield * E.fork(DiscordApi.deleteOriginalInteractionResponse(app_id, token));
      // yield * DiscordApi.deleteOriginalInteractionResponse(app_id, curr.token, { type: TxType.UPDATE_MESSAGE, data: { content   : '', embeds    : [], components: [], }, });
    })),

    defer: (type: Tx.Defer) => mutex(g(function * () {
      yield * E.logDebug(`[defer]`);
      yield * E.logTrace(`defer ${type._tag} (ephemeral: ${curr.ephemeral})`);

      if (curr.deferred) return yield * new Failure.Critical({why: 'Already deferred'});
      if (Tx.isNone(type)) return yield * new Failure.Critical({why: 'Invalid defer'});
      if (Tx.isClose(type)) return yield * new Failure.Critical({why: 'Invalid defer'});

      curr.deferred = true;
      curr.res_type = type;

      if (Tx.isOpenDialog(type)) {
        yield * E.logTrace(`open dialog, fake defer`);
        return yield * E.fork(E.void);
      }
      if (curr.ephemeral && Tx.isPrivate(type)) {
        curr.res_type = Tx.PrivateUpdate;
      }
      curr.active = pipe(DT.unsafeNow(), DT.addDuration('14 minutes'), DT.toEpochMillis);
      return yield * E.fork(DiscordApi.createInteractionResponse(curr.id, curr.token, curr.res_type));
    })),

    reply: (data: Partial<EditWebhookMessageParams> | InteractionCallbackModal) => mutex(g(function * () {
      yield * E.logDebug(`[reply]`);

      if (Tx.isClose(curr.res_type)) return yield * new Failure.Critical({why: 'Invalid reply'});

      if (Tx.isOpenDialog(curr.res_type)) {
        yield * E.logTrace(`open dialog`);
        return yield * E.fork(
          DiscordApi.createInteractionResponse(curr.id, curr.token, makeDialog(data)),
        );
      }

      if (curr.deferred) {
        yield * E.logTrace(`edit ${curr.res_type._tag}`);
        return yield * E.fork(
          DiscordApi.editOriginalInteractionResponse(app_id, curr.token, {
            ...data,
            flags: curr.ephemeral ? TxFlag.EPHEMERAL : undefined,
          }),
        );
      }

      yield * E.logTrace(`create (no defer)`);

      return yield * E.fork(
        DiscordApi.createInteractionResponse(curr.id, curr.token, {
          type: Tx.Public.type,
          data: data as InteractionCallbackDatum,
        }),
      );
    })),

    editReply: (data: Partial<EditWebhookMessageParams>) => mutex(g(function * () {
      yield * E.logDebug(`[DiscordBroker]: async edit ${curr.res_type._tag}`);

      if (Tx.isClose(curr.res_type)) return yield * new Failure.Critical({why: 'Invalid reply'});

      if (!curr.deferred) {
        return yield * new Failure.Critical({why: 'Not deferred'});
      }
      return yield * E.fork(DiscordApi.editOriginalInteractionResponse(app_id, curr.token, data));
    })),
  };
});


export class DiscordBroker extends E.Tag('DiscordBroker')<
  DiscordBroker,
  EAR<typeof implementation>
>() {
  static makeLayer = () => L.effect(this, implementation());
}
