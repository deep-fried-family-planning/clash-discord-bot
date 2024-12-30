import {startContext, stopContext} from '#discord/context/context.ts';
import {saveCurrentIxForDialog} from '#discord/context/dialog-relay.ts';
import type {Driver} from '#discord/context/model-driver.ts';
import {Nx, Tx} from '#discord/entities/basic';
import {CLOSE, DIALOG} from '#discord/entities/constants/constants.ts';
import {getNextView, getViewModifier} from '#discord/entities/hooks/hooks.ts';
import type {CxPath} from '#discord/entities/routing/cx-path.ts';
import type {IxIn} from '#discord/types.ts';
import type {RestDataComponent} from '#pure/dfx';
import {E, g, p} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import type {unk} from '#src/internal/pure/types-pure.ts';


export const clickEphemeral = (driver: Driver, ax: CxPath, ix: IxIn) => g(function * () {
  const rx = Nx.decodeMessage(ix);

  startContext(rx.embeds, ax);

  yield * p(
    Nx.renderViewNode(driver.views[ax.view]),
    E.flatMap(Nx.simulateViewNodeClick(ix.data as unk as RestDataComponent)),
  );

  const nextView         = getNextView();
  const nextViewModifier = getViewModifier();

  if (nextViewModifier === DIALOG) {
    yield * p(
      Nx.renderViewNode(driver.views[nextView], ix),
      E.map(Nx.encodeDialog(rx)),
      E.flatMap(Tx.reply(ix)),
    );

    yield * p(
      Nx.renderViewNode(driver.views[ax.view]),
      E.map(Nx.encodeMessage(rx)),
      E.flatMap((tx) => saveCurrentIxForDialog(ix, tx.embeds, tx.components)),
    );

    // return yield * openDialog(driver, ax, ix, updatedComponent, rx_embeds);
    return stopContext();
  }

  yield * DiscordApi.deferUpdate(ix);

  if (nextViewModifier === CLOSE) {
    return yield * DiscordApi.deleteMenu(ix);
  }

  yield * p(
    Nx.renderViewNode(driver.views[nextView]),
    E.map(Nx.encodeMessage(rx)),
    E.flatMap(Tx.reply(ix)),
  );

  return stopContext();
});
