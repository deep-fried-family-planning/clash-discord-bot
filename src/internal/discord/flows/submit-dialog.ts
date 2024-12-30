import {startContext, stopContext} from '#discord/context/context.ts';
import {getPreviousIxForDialog} from '#discord/context/dialog-relay.ts';
import type {Driver} from '#discord/context/model-driver.ts';
import {Nx, Tx} from '#discord/entities/basic';
import {renderViewNode} from '#discord/entities/basic/node-data.ts';
import {getFirstView} from '#discord/entities/hooks/hooks.ts';
import type {CxPath} from '#discord/entities/routing/cx-path.ts';
import type {IxIn} from '#discord/types.ts';
import type {RestDataDialog} from '#pure/dfx';
import {E, g, p} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';


export const submitDialog = (driver: Driver, ax: CxPath, ix: IxIn, ix_data: RestDataDialog) => g(function * () {
  yield * DiscordApi.deferUpdate(ix);

  const ix_previous = yield * getPreviousIxForDialog(ax.mod);
  const rx_message  = Nx.decodeMessage(ix_previous);
  const rx_dialog   = Nx.decodeDialog(ix);

  startContext(rx_message.embeds, ax);

  const vx_dialog = yield * renderViewNode(driver.views[ax.view], ix);

  // const dialog = yield * Nx.renderViewNode(driver.views[ax.dialog]);

  const nextView = getFirstView();


  yield * p(
    Nx.renderViewNode(driver.views[rx_message.view]),
    E.map(Nx.encodeMessage(rx_message, rx_dialog)),
    E.flatMap(Tx.reply(ix)),
  );

  return stopContext();
});
