import {startContext, stopContext, updateUrlContext} from '#discord/context/context.ts';
import type {Driver} from '#discord/context/model-driver.ts';
import type {Nx} from '#discord/entities/basic';
import {Cx, Ex, Nv} from '#discord/entities/basic';
import {CLOSE} from '#discord/entities/constants/constants.ts';
import {getNextView, getViewModifier} from '#discord/entities/hooks/hooks.ts';
import {updateUseEffect} from '#discord/entities/hooks/use-effect.ts';
import type {CxPath} from '#discord/entities/routing/cx-path.ts';
import {openDialog} from '#discord/flows/open-dialog.ts';
import {simulateComponentClick} from '#discord/flows/simulate-click.ts';
import type {IxIn} from '#discord/types.ts';
import type {RestDataComponent} from '#pure/dfx';
import {g, pipe} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';


export const clickEphemeral = (driver: Driver, ax: CxPath, ix: IxIn) => g(function * () {
  const rx_embeds     = Ex.decodeGrid(ix.message?.embeds);
  const rx_components = Cx.decodeGrid(ix.message?.components);

  startContext(rx_embeds, ax);

  Nv.render(driver.views[ax.view]);

  yield * updateUseEffect;

  const original = Nv.render(driver.views[ax.view]);

  const updatedComponent = yield * simulateComponentClick(original, rx_components, ix.data as RestDataComponent, ax);

  const nextViewName = getNextView();

  const next_shallow = driver.views[nextViewName];

  if (next_shallow._tag === 'Dialog') {
    return yield * openDialog(driver, ax, ix, updatedComponent, rx_embeds);
  }

  yield * DiscordApi.deferUpdate(ix);

  const nextViewModifier = getViewModifier();

  if (nextViewModifier === CLOSE) {
    return yield * DiscordApi.deleteMenu(ix);
  }

  const next = Nv.render(next_shallow) as Extract<Nx.T, {_tag: 'Message'}>;

  yield * DiscordApi.editMenu(ix, {
    embeds    : updateUrlContext(next.embeds, rx_embeds),
    components: pipe(
      next.components,
      Cx.mapGrid((cx, row, col) => {
        if (original.name === next.name && row === ax.row && col === ax.col) {
          return {
            ...cx,
            data: {
              ...cx,
              ...updatedComponent,
            },
          } as typeof cx;
        }
        return cx;
      }),
      Cx.encodeGrid(next.path),
    ),
  });

  return stopContext();
});
