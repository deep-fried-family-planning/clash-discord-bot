import type {Doken} from '#src/disreact/abstract/index.ts';
import {Rest} from '#src/disreact/abstract/index.ts';
import {DiscordDOM} from '#src/disreact/interface/service.ts';
import {DoNotLog} from '#src/disreact/internal/codec/debug.ts';
import {E, flow, L, pipe} from '#src/internal/pure/effect.ts';
import {DiscordREST} from 'dfx';



const make = pipe(DiscordREST, E.map((rest) => {
  const Create = flow(rest.createInteractionResponse, DoNotLog);
  const Delete = flow(rest.deleteOriginalInteractionResponse, DoNotLog);
  const Edit   = flow(rest.editOriginalInteractionResponse, DoNotLog);

  return {
    acknowledge: (d: Doken.T) => Create(d.id, d.token, {type: Rest.DEFER_UPDATE}),
    defer      : (d: Doken.T) => Create(d.id, d.token, d.flags === 0 ? {type: d.type} : {type: d.type, data: {flags: Rest.EPHEMERAL}}),
    create     : (d: Doken.T, encoded: Rest.Response) => Create(d.id, d.token, {type: d.type, data: encoded}),
    reply      : (d: Doken.T, encoded: Rest.Response) => Edit(d.app, d.token, encoded),
    update     : (d: Doken.T, encoded: Rest.Message) => Edit(d.app, d.token, encoded),
    dismount   : (d: Doken.T) => Delete(d.app, d.token),
    // render     : (channel_id: string) => rest.createMessage(channel_id),
  };
}));


export const makeDiscordDOMDFX = L.effect(DiscordDOM, make);
