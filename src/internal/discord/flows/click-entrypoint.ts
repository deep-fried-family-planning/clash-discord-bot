import {startContext, stopContext, updateUrlContext} from '#discord/context/context.ts';
import type {Driver} from '#discord/context/model-driver.ts';
import {makeGrid} from '#discord/entities/cx.ts';
import type {CxPath} from '#discord/entities/routing/cx-path.ts';
import {updateUseEffect} from '#discord/hooks/use-effect.ts';
import type {IxIn} from '#discord/types.ts';
import type {RestDataComponent} from '#pure/dfx';
import {g} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {ExV} from '../index.ts';


export const clickEntrypoint = (driver: Driver, ax: CxPath, ix: IxIn, ix_data: RestDataComponent) => g(function * () {
  yield * DiscordApi.deferEntryEphemeral(ix);

  const rx_embeds = ExV.decodeAll(ix.message?.embeds ?? []);

  startContext(rx_embeds, ax);

  const will_mount = driver.views[ax.view].view(driver.name, ix_data);

  yield * updateUseEffect;

  const next_embeds     = updateUrlContext(will_mount.embeds);
  const next_components = makeGrid(will_mount.components, ix_data, ax);

  yield * DiscordApi.editMenu(ix, {
    embeds    : next_embeds,
    components: next_components,
  });
  return stopContext();
});
