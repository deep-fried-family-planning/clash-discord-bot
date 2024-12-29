import {stopContext, updateUrlContext} from '#discord/context/context.ts';
import {saveCurrentIxForDialog} from '#discord/context/dialog-relay.ts';
import type {Driver} from '#discord/context/model-driver.ts';
import type {CxPath} from '#discord/entities/cx-path.ts';
import {makeGrid} from '#discord/entities/cxt.ts';
import {simulateDialogOpen} from '#discord/flows/simulate-click.ts';
import {getNextView} from '#discord/hooks/hooks.ts';
import {updateDialogRefComponents} from '#discord/hooks/use-dialog-ref.ts';
import {updateUseEffect} from '#discord/hooks/use-effect.ts';
import type {IxIn} from '#discord/types.ts';
import type {RestDataComponent} from '#pure/dfx';
import {g, p} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import type {ExV} from '..';
import {Cx} from '..';


export const openDialog = (driver: Driver, ax: CxPath, ix: IxIn, ix_data: RestDataComponent, rx_embeds: ExV.T[]) => g(function * () {
  const nextView = getNextView();

  const dialog = driver.views[nextView].view(driver.name, ix_data);

  yield * updateUseEffect;
  simulateDialogOpen(dialog);

  yield * DiscordApi.openModal(ix, {
    custom_id: p(
      dialog.dialog.route,
      Cx.Path.set('view', ax.view),
      Cx.Path.set('mod', ix.id),
      Cx.Path.build,
    ),
    title     : dialog.dialog.title,
    components: makeGrid(updateDialogRefComponents(rx_embeds, dialog.components), ix.data, Cx.Path.empty()),
  });

  const next            = driver.views[ax.view].view(driver.name, ix.data);
  const next_embeds     = updateUrlContext(next.embeds, rx_embeds);
  const next_components = makeGrid(next.components, ix.data, ax);

  yield * saveCurrentIxForDialog(ix, next_embeds, next_components);

  return stopContext();
});
