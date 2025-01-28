import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {Defer} from '#src/disreact/api/index.ts';
import {CriticalFailure} from '#src/disreact/enum/errors.ts';
import {ContextManager} from '#src/disreact/runtime/layer/ContextManager.ts';
import {TTL} from '#src/disreact/runtime/types/index.ts';
import {E, L} from '#src/internal/pure/effect';
import type {EA} from '#src/internal/types.ts';



export const deleteResponse = E.gen(function * () {
  const context  = yield * ContextManager.getAll();
  const tokens   = context.tokens;
  const rightNow = TTL.rightNow();

  if (!TTL.isActiveBuffered(tokens.prev.ttl, rightNow)) {
    yield * DiscordApi.deleteOriginalInteractionResponse(
      context.app,
      tokens.prev.value,
    );
  }

  if (!TTL.isActive(tokens.rest.ttl, rightNow)) {
    yield * DiscordApi.createInteractionResponse(
      context.id,
      tokens.rest.value,
      tokens.rest.ephemeral
        ? Defer.PrivateUpdate()
        : Defer.PublicUpdate(),
    );
    yield * DiscordApi.deleteOriginalInteractionResponse(
      context.app,
      tokens.rest.value,
    );
  }

  return yield * new CriticalFailure();
});


export const deferResponse = E.fn('DisReact.deferResponse')(function * () {
  const context = yield * ContextManager.getAll();
});


export const renderResponse = E.gen(function * () {
  const context = yield * ContextManager.getAll();
});


export const updateResponse = E.gen(function * () {
  const context = yield * ContextManager.getAll();
});


const program = E.gen(function * () {
  return {
    deleteResponse,
    deferResponse,
    renderResponse,
    updateResponse,
  };
});


export class Broker extends E.Tag('DisReact.Broker')<
  Broker,
  EA<typeof program>
  // EA<ReturnType<EA<typeof program>>>
>() {
  static singleton = L.effect(this, program.pipe(
    E.cached,
    E.flatten,
  ));
}
