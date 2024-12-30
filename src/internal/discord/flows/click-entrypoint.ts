import {startContext, stopContext} from '#discord/context/context.ts';
import type {Driver} from '#discord/context/model-driver.ts';
import {Nx, Tx} from '#discord/entities/basic';
import type {CxPath} from '#discord/entities/routing/cx-path.ts';
import type {IxIn} from '#discord/types.ts';
import {E, g, p} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';


export const clickEntrypoint = (driver: Driver, ax: CxPath, ix: IxIn) => g(function * () {
  yield * DiscordApi.deferEntryEphemeral(ix);

  const rx = Nx.decodeMessage(ix);

  startContext(rx.embeds, ax);

  yield * p(
    Nx.renderViewNode(driver.views[ax.view]),
    E.map(Nx.encodeMessage()),
    E.flatMap(Tx.reply(ix)),
  );

  return stopContext();
});
