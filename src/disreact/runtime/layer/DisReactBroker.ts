import {ContextManager} from '#disreact/runtime/layer/ContextManager.ts';
import {Token} from '#disreact/api/index.ts';
import {C, E, g, L, pipe} from '#pure/effect';
import type {Ix} from '#src/internal/disreact/virtual/entities/dapi.ts';
import type {EA} from '#src/internal/types.ts';


const tokenCache = g(function * () {
  const tokens = yield * C.make({
    capacity  : 1000,
    timeToLive: '10 minutes',
    lookup    : () => E.succeed(Token.Unknown() as Token.Token),
  });

  const setToken = (rest: Ix) => g(function * () {
    const token = Token.make(rest);
    yield * tokens.set(token.id, token);
    return token;
  });

  return {
    setToken: setToken,

    getToken: (id: string) => g(function * () {
      const hasToken = yield * tokens.contains(id);

      if (!hasToken) return null;

      const token = yield * tokens.get(id);

      if (!Token.isActive(token)) {
        yield * tokens.invalidate(id);
        return null;
      }
      return token;
    }),

    saveToken: (rest: Ix) => {
      return setToken(rest);
    },
  };
});


const deleteResponse = E.gen(function * () {
  const context = yield * ContextManager.getAll();

  // if (didDefer) return yield * new Err.Impossible();
  //
  // current  = Df.Close;
  // didDefer = true;
  //
  // const failsafe = g(function * () {
  //   yield * DiscordApi.ixDefer(ix.curr_id, ix.curr_token, Df.Private);
  //   yield * DiscordApi.ixDelete(ix.app_id, ix.curr_token);
  // });
  //
  // if (ix.prev_active > Date.now()) {
  //   return yield * pipe(
  //     DisReactMemory.load(ix.prev_id),
  //     E.flatMap((dom) => E.asVoid(DiscordApi.ixDelete(ix.app_id, dom.token))),
  //     E.catchTag('MemoryUnavailable', () => failsafe),
  //     E.catchTag('MemoryExpired', () => failsafe),
  //     E.fork,
  //   );
  // }
  //
  // return yield * pipe(
  //   failsafe,
  //   E.fork,
  // );
});


const deferResponse = E.gen(function * () {
  const context = yield * ContextManager.getAll();

  // if (Df.isNone(defer)) return yield * new Err.Impossible();
  // if (Df.isClose(defer)) return yield * new Err.Impossible();
  // if (didDefer) return yield * new Err.Impossible();
  //
  // current  = defer;
  // didDefer = true;
  //
  // if (Df.isOpenDialog(defer)) {
  //   return yield * pipe(
  //     E.void,
  //     E.fork,
  //   );
  // }
  //
  // return yield * pipe(
  //   DiscordApi.ixDefer(ix.curr_id, ix.curr_token, defer),
  //   E.asVoid,
  //   E.fork,
  // );
});


const renderResponse = E.gen(function * () {
  const context = yield * ContextManager.getAll();

  // if (Df.isNone(current)) return yield * new Err.Impossible();
  // if (Df.isClose(current)) return yield * new Err.Impossible();
  //
  // if (Df.isOpenDialog(current)) {
  //   return yield * pipe(
  //     DiscordApi.ixDialog(ix.curr_id, ix.curr_token, data as InteractionCallbackModal),
  //     E.asVoid,
  //     E.fork,
  //   );
  // }
  //
  // if (!didDefer) {
  //   return yield * pipe(
  //     DiscordApi.createInteractionResponse(ix.curr_id, ix.curr_token, {
  //       type: Df.Public.rest.type,
  //       data: data as InteractionCallbackDatum,
  //     }),
  //     E.asVoid,
  //   );
  // }
  //
  // return yield * pipe(
  //   DiscordApi.ixEdit(ix.app_id, ix.curr_token, {
  //     ...data as DA.TxMessage,
  //     flags: ix.prev_ephemeral ? DA.En.MF.EPHEMERAL : undefined,
  //   }),
  //   E.asVoid,
  // );
});


const updateResponse =  E.gen(function * () {
  const context = yield * ContextManager.getAll();

  // if (!didDefer) return yield * new Err.Impossible();
  // if (Df.isNone(current)) return yield * new Err.Impossible();
  // if (Df.isClose(current)) return yield * new Err.Impossible();
  //
  // if (Df.isOpenDialog(current)) {
  //   return yield * pipe(
  //     DiscordApi.ixEdit(ix.app_id, ix.prev_id, data),
  //     E.asVoid,
  //     E.fork,
  //   );
  // }
  //
  // return yield * pipe(
  //   DiscordApi.ixEdit(ix.app_id, ix.curr_token, data),
  // );
});


const program = E.cachedFunction((app_id: string) => E.gen(function * () {
  const tokens = yield * tokenCache;

  return {
    ...tokens,
    app_id,
    deleteResponse,
    deferResponse,
    renderResponse,
    updateResponse,
  };
}));


export class Broker extends E.Tag('DisReact.Broker')<
  Broker,
  EA<ReturnType<EA<typeof program>>>
>() {
  static singleton = (app_id: string) => L.effect(this, pipe(
    program,
    E.flatMap((cached) => cached(app_id)),
  ));
}
