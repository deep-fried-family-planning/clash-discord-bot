import {ENTRY} from '#discord/constants/constants.ts';
import {IxService} from '#discord/context/ix-service.ts';
import {Nx} from '#discord/entities';
import {g} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';


export const openEntrypoint = g(function * () {
  const ax = yield * IxService.getAction();
  const ix = yield * IxService.getIxMessage();

  if (ax.mod !== ENTRY) {
    return;
  }
  yield * DiscordApi.deferEntryEphemeral(ix);

  const rx_node = yield * IxService.getRxMessageNode();
  const view    = yield * Nx.renderViewNode();
});
