import {stopContext, updateUrlContext} from '#discord/context/context.ts';
import {saveCurrentIxForDialog} from '#discord/context/dialog-relay.ts';
import type {Driver} from '#discord/context/model-driver.ts';
import {Cx, type Ex, Nv} from '#discord/entities/basic';
import {DeveloperError} from '#discord/entities/errors/developer-error.ts';
import {getNextView} from '#discord/entities/hooks/hooks.ts';
import {updateDialogRefComponents} from '#discord/entities/hooks/use-dialog-ref.ts';
import {updateUseEffect} from '#discord/entities/hooks/use-effect.ts';
import type {CxPath} from '#discord/entities/routing/cx-path.ts';
import type {IxIn} from '#discord/types.ts';
import {g, p, pipe} from '#pure/effect';
import {original} from '#src/discord/ixc-original.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';


export const openDialog = (driver: Driver, ax: CxPath, ix: IxIn, updatedComponent: Cx.T['data'], rx_embeds: Ex.Grid) => g(function * () {
  const nextView = getNextView();

  const dialog = Nv.render(driver.views[nextView]);

  if (dialog._tag === 'Message') {
    return yield * new DeveloperError({});
  }

  yield * updateUseEffect;
  // simulateDialogOpen(dialog);

  yield * DiscordApi.openModal(ix, {
    custom_id: p(
      dialog.path,
      Cx.Path.set('view', ax.view),
      Cx.Path.set('dialog', dialog.name),
      Cx.Path.set('mod', ix.id),
      Cx.Path.build,
    ),
    title     : dialog.title,
    components: pipe(
      updateDialogRefComponents(rx_embeds, dialog.components),
      Cx.encodeGrid(dialog.path),
    ),
  });

  const next            = Nv.render(driver.views[ax.view]);
  const next_embeds     = updateUrlContext(next.embeds, rx_embeds);
  const next_components = pipe(
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
  );

  yield * saveCurrentIxForDialog(ix, next_embeds, next_components);

  return stopContext();
});
