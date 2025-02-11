import type {Doken} from '#src/disreact/abstract/index.ts';
import {Rest} from '#src/disreact/abstract/index.ts';
import {DiscordDOM} from '#src/disreact/interface/service.ts';
import {DoNotLog} from '#src/disreact/internal/codec/debug.ts';
import {makeDeferred} from '#src/disreact/internal/codec/doken-codec.ts';
import {E, flow, L} from '#src/internal/pure/effect.ts';
import {DiscordREST} from 'dfx';
import {pipe} from 'effect';



export const makeDfx = E.gen(function * () {
  const rest = yield * DiscordREST;

  const Create = flow(rest.createInteractionResponse, DoNotLog);
  const Delete = flow(rest.deleteOriginalInteractionResponse, DoNotLog);
  const Edit   = flow(rest.editOriginalInteractionResponse, DoNotLog);

  const acknowledge = (d: Doken.T) => Create(d.id, d.token, {type: Rest.DEFER_UPDATE});

  const defer       = (d: Doken.T) => pipe(
    Create(d.id, d.token, d.flags === 0 ? {type: d.type} : {type: d.type, data: {flags: Rest.EPHEMERAL}}),
    E.as(makeDeferred(d)),
  );

  const create      = (d: Doken.T, encoded: Rest.Response) => Create(d.id, d.token, {type: d.type, data: encoded});
  const reply       = (d: Doken.T, encoded: Rest.Response) => Edit(d.app, d.token, encoded);
  const update      = (d: Doken.T, encoded: Rest.Message) => Edit(d.app, d.token, encoded);
  const dismount    = (d: Doken.T) => Delete(d.app, d.token);
  // render     : (channel_id: string) => rest.createMessage(channel_id),

  return {
    acknowledge,
    defer,
    create,
    reply,
    update,
    dismount,
  };
});
