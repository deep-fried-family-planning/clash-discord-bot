import {startContext, stopContext, updateUrlContext} from '#discord/context/context.ts';
import type {Driver} from '#discord/context/model-driver.ts';
import {CLOSE, DIALOG} from '#discord/entities/constants/constants.ts';
import {makeGrid} from '#discord/entities/cx.ts';
import type {CxPath} from '#discord/entities/routing/cx-path.ts';
import {openDialog} from '#discord/simulation/flows/open-dialog.ts';
import {simulateComponentClick} from '#discord/simulation/flows/simulate-click.ts';
import {getNextView, getViewModifier} from '#discord/simulation/hooks/hooks.ts';
import {updateUseEffect} from '#discord/simulation/hooks/use-effect.ts';
import type {IxIn} from '#discord/types.ts';
import type {RestDataComponent} from '#pure/dfx';
import {g, p} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {Cx, ExV} from '../../index.ts';


export const clickEphemeral = (driver: Driver, ax: CxPath, ix: IxIn) => g(function * () {
  const rx_embeds = ExV.decodeAll(ix.message?.embeds ?? []);

  startContext(rx_embeds, ax);

  const original = driver.views[ax.view].view(driver.name, ix.data);

  yield * updateUseEffect;

  yield * simulateComponentClick(original, ax, p(ix.message?.components ?? [], Cx.mapFromDiscordRest((rx) => Cx.decode(rx))));


  const nextView         = getNextView();
  const nextViewModifier = getViewModifier();


  if (nextViewModifier === DIALOG) {
    yield * openDialog(driver, ax, ix, ix.data as RestDataComponent, rx_embeds);
  }


  yield * DiscordApi.deferUpdate(ix);

  const next = driver.views[nextView].view(driver.name, ix.data);

  const next_embeds     = updateUrlContext(next.embeds, rx_embeds);
  const next_components = makeGrid(next.components, ix.data, ax, p(ix.message?.components ?? [], Cx.mapFromDiscordRest((rx) => Cx.decode(rx))));

  if (nextViewModifier === CLOSE) {
    return yield * DiscordApi.deleteMenu(ix);
  }

  yield * DiscordApi.editMenu(ix, {
    embeds    : next_embeds,
    components: next_components,
  });

  return stopContext();
});
