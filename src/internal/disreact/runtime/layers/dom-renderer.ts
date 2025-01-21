import {E, g, L, pipe} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {DisReactContext} from '#src/internal/disreact/runtime/layers/disreact-context.ts';
import {DisReactMemory} from '#src/internal/disreact/runtime/layers/disreact-memory.ts';
import {DA, Df, In} from '#src/internal/disreact/virtual/entities/index.ts';
import {Err} from '#src/internal/disreact/virtual/kinds/index.ts';
import type {EAR} from '#src/internal/types.ts';
import type {InteractionCallbackDatum, InteractionCallbackModal} from 'dfx/types';


const domRenderer = E.fn('Renderer')(function * () {
  const semaphore = yield * E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);

  let current  = Df.None,
      ix       = In.None as In.Click | In.Submit,
      didDefer = false;

  return {
    allocate: (defer: Df.T) => pipe(
      g(function * () {
        current  = defer;
        ix       = yield * DisReactContext.current();
        didDefer = false;
      }),
      mutex,
    ),


    current: () => current,


    delete: E.fn('Renderer.delete')(
      function * () {
        yield * E.logTrace('Renderer.delete');

        if (didDefer) return yield * new Err.Impossible();

        current  = Df.Close;
        didDefer = true;

        const failsafe = g(function * () {
          yield * DiscordApi.ixDefer(ix.curr_id, ix.curr_token, Df.Private);
          yield * DiscordApi.ixDelete(ix.app_id, ix.curr_token);
        });

        if (ix.prev_active > Date.now()) {
          return yield * pipe(
            DisReactMemory.load(ix.prev_id),
            E.flatMap((dom) => E.asVoid(DiscordApi.ixDelete(ix.app_id, dom.token))),
            E.catchTag('MemoryUnavailable', () => failsafe),
            E.catchTag('MemoryExpired', () => failsafe),
            E.tap(E.logTrace('Renderer.delete: complete')),
            E.fork,
          );
        }

        return yield * pipe(
          failsafe,
          E.tap(E.logTrace('Renderer.delete: complete')),
          E.fork,
        );
      },
      mutex,
    ),


    defer: E.fn('Renderer.defer')(
      function * (defer: Df.T) {
        yield * E.logTrace('Renderer.defer');

        if (Df.isNone(defer)) return yield * new Err.Impossible();
        if (Df.isClose(defer)) return yield * new Err.Impossible();
        if (didDefer) return yield * new Err.Impossible();

        current  = defer;
        didDefer = true;

        if (Df.isOpenDialog(defer)) {
          return yield * pipe(
            E.void,
            E.tap(E.logTrace('Renderer.defer: complete')),
            E.fork,
          );
        }

        return yield * pipe(
          DiscordApi.ixDefer(ix.curr_id, ix.curr_token, defer),
          E.tap(E.logTrace('Renderer.defer: complete')),
          E.asVoid,
          E.fork,
        );
      },
      mutex,
    ),


    render: E.fn('Renderer.render')(
      function * (data: DA.TxDialog | DA.TxMessage) {
        yield * E.logTrace('Renderer.render');

        if (Df.isNone(current)) return yield * new Err.Impossible();
        if (Df.isClose(current)) return yield * new Err.Impossible();

        if (Df.isOpenDialog(current)) {
          return yield * pipe(
            DiscordApi.ixDialog(ix.curr_id, ix.curr_token, data as InteractionCallbackModal),
            E.asVoid,
            E.fork,
          );
        }

        if (!didDefer) {
          return yield * pipe(
            DiscordApi.createInteractionResponse(ix.curr_id, ix.curr_token, {
              type: Df.Public.rest.type,
              data: data as InteractionCallbackDatum,
            }),
            E.asVoid,
            E.tap(E.logTrace('Renderer.render: complete')),
          );
        }

        return yield * pipe(
          DiscordApi.ixEdit(ix.app_id, ix.curr_token, {
            ...data as DA.TxMessage,
            flags: ix.prev_ephemeral ? DA.En.MF.EPHEMERAL : undefined,
          }),
          E.asVoid,
          E.tap(E.logTrace('Renderer.render: complete')),
        );
      },
      mutex,
    ),


    rerender: E.fn('Renderer.rerender')(
      function * (data: DA.TxMessage) {
        yield * E.logTrace('Renderer.rerender');

        if (!didDefer) return yield * new Err.Impossible();
        if (Df.isNone(current)) return yield * new Err.Impossible();
        if (Df.isClose(current)) return yield * new Err.Impossible();

        if (Df.isOpenDialog(current)) {
          return yield * pipe(
            DiscordApi.ixEdit(ix.app_id, ix.prev_id, data),
            E.asVoid,
            E.fork,
          );
        }

        return yield * pipe(
          DiscordApi.ixEdit(ix.app_id, ix.curr_token, data),
          E.asVoid,
          E.tap(E.logTrace('Renderer.rerender: complete')),
          E.fork,
        );
      },
      mutex,
    ),
  };
});


export class Renderer extends E.Tag('Renderer')<
  Renderer,
  EAR<typeof domRenderer>
>() {
  static makeInstance = () => L.effect(this, domRenderer());
}
