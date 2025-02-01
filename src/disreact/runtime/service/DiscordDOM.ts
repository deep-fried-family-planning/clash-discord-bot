import {DoNotLog} from '#src/disreact/runtime/service/debug.ts';
import type {Doken} from '#src/disreact/runtime/enum/index.ts';
import {Rest} from '#src/disreact/runtime/enum/index.ts';
import {E, flow, L, pipe} from '#src/internal/pure/effect.ts';
import {DiscordREST} from 'dfx/DiscordREST';



const make = pipe(DiscordREST, E.map((rest) => {
  const Create = flow(rest.createInteractionResponse, DoNotLog);
  const Delete = flow(rest.deleteOriginalInteractionResponse, DoNotLog);
  const Edit   = flow(rest.editOriginalInteractionResponse, DoNotLog);

  return {
    acknowledge : (doken: Doken.T) => Create(doken.id, doken.token, {type: Rest.DEFER_UPDATE}),
    deferRender : (doken: Doken.T) => Create(doken.id, doken.token, doken.flags === 0 ? {type: doken.type} : {type: doken.type, data: {flags: Rest.EPHEMERAL}}),
    renderDirect: (doken: Doken.T, encoded: Rest.Response) => Create(doken.id, doken.token, {type: doken.type, data: encoded}),
    renderReply : (doken: Doken.T, encoded: Rest.Response) => Edit(doken.app, doken.token, encoded),
    renderUpdate: (doken: Doken.T, encoded: Rest.Message) => Edit(doken.app, doken.token, encoded),
    dismount    : (doken: Doken.T) => Delete(doken.app, doken.token),
    render      : (channel_id: string) => rest.createMessage(channel_id),
  };
}));

export class DiscordDOM extends E.Tag('DisReact.DiscordDOM')<
  DiscordDOM,
  E.Effect.Success<typeof make>
>() {
  static singletonLayer = L.effect(this, make);
}
