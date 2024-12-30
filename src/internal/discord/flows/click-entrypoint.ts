import {startContext, stopContext, updateUrlContext} from '#discord/context/context.ts';
import type {Driver} from '#discord/context/model-driver.ts';
import {Cx, Ex, Nv} from '#discord/entities/basic';
import {DeveloperError} from '#discord/entities/errors/developer-error.ts';
import {updateUseEffect} from '#discord/entities/hooks/use-effect.ts';
import type {CxPath} from '#discord/entities/routing/cx-path.ts';
import type {IxIn} from '#discord/types.ts';
import type {RestDataComponent} from '#pure/dfx';
import {g, pipe} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';


export const clickEntrypoint = (driver: Driver, ax: CxPath, ix: IxIn, ix_data: RestDataComponent) => g(function * () {
  yield * DiscordApi.deferEntryEphemeral(ix);

  const rx_embeds = Ex.decodeGrid(ix.message?.embeds);

  startContext(rx_embeds, ax);

  Nv.render(driver.views[ax.view]);

  yield * updateUseEffect;

  const next = Nv.render(driver.views[ax.view]);

  if (next._tag === 'Dialog') {
    return yield * new DeveloperError({});
  }

  yield * DiscordApi.editMenu(ix, {
    embeds    : updateUrlContext(next.embeds, rx_embeds),
    components: pipe(next.components, Cx.encodeGrid(next.path)),
  });
  return stopContext();
});
