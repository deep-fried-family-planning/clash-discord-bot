import {startContext, stopContext, updateUrlContext} from '#discord/context/context.ts';
import {getPreviousIxForDialog} from '#discord/context/dialog-relay.ts';
import type {Driver} from '#discord/context/model-driver.ts';
import {Cx, Ex, Nv} from '#discord/entities/basic';
import {getFirstView} from '#discord/entities/hooks/hooks.ts';
import {updateDialogRefEmbeds} from '#discord/entities/hooks/use-dialog-ref.ts';
import type {CxPath} from '#discord/entities/routing/cx-path.ts';
import type {IxIn} from '#discord/types.ts';
import type {RestDataDialog} from '#pure/dfx';
import {g, pipe} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';


export const submitDialog = (driver: Driver, ax: CxPath, ix: IxIn, ix_data: RestDataDialog) => g(function * () {
  yield * DiscordApi.deferUpdate(ix);

  const rx        = yield * getPreviousIxForDialog(ax.mod);
  const rx_embeds = Ex.decodeGrid(rx.message?.embeds);

  startContext(rx_embeds, ax);


  const dialog    = Nv.render(driver.views[ax.dialog]);
  const rx_dialog = Cx.decodeGrid(ix_data.components);


  const updatedDialogComponents = pipe(
    dialog.components,
    Cx.mapGrid((cx, row, col) => ({
      ...cx,
      data: {
        ...cx.data,
        ...rx_dialog[row][col].data,
      },
    } as typeof cx)),
  );


  // simulateDialogSubmit(dialog);

  const nextView = getFirstView();


  const original = Nv.render(driver.views[nextView]);
  const embeds   = updateDialogRefEmbeds(original.embeds, updatedDialogComponents);


  yield * DiscordApi.editMenu(ix, {
    embeds    : updateUrlContext(embeds),
    components: pipe(
      original.components,
      Cx.encodeGrid(original.path),
    ),
  });


  return stopContext();
});
