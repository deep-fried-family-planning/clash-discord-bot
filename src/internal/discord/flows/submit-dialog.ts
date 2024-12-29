import {startContext, stopContext, updateUrlContext} from '#discord/context/context.ts';
import {getPreviousIxForDialog} from '#discord/context/dialog-relay.ts';
import type {Driver} from '#discord/context/model-driver.ts';
import {makeGrid} from '#discord/entities/cx.ts';
import type {CxPath} from '#discord/entities/routing/cx-path.ts';
import {simulateDialogSubmit} from '#discord/flows/simulate-click.ts';
import {getFirstView} from '#discord/hooks/hooks.ts';
import {updateDialogRefEmbeds} from '#discord/hooks/use-dialog-ref.ts';
import type {IxIn} from '#discord/types.ts';
import type {RestDataDialog} from '#pure/dfx';
import {g, p, pipe} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {Cx, ExV} from '../index.ts';


export const submitDialog = (driver: Driver, ax: CxPath, ix: IxIn, ix_data: RestDataDialog) => g(function * () {
  yield * DiscordApi.deferUpdate(ix);

  const rx        = yield * getPreviousIxForDialog(ax.mod);
  const rx_embeds = ExV.decodeAll(rx.message?.embeds ?? []);

  startContext(rx_embeds, ax);


  const dialog = driver.views[ax.dialog].view(driver.name, ix_data, ax.view);


  const rx_dialog = pipe(
    ix_data.components,
    Cx.mapFromDiscordRest((a, row, col) => pipe(
      Cx.decode(a),
      Cx.mapSame((cx) => ({
        ...cx,
        route: pipe(
          Cx.Path.empty(),
          Cx.Path.set('row', row),
          Cx.Path.set('row', col),
        ),
      }))),
    ),
  );


  dialog.components = dialog.components.map((r, row) => r.map((dx, col) => ({
    ...dx,
    data: {
      ...dx.data,
      ...rx_dialog[row][col].data,
    },
  } as typeof dx)));


  simulateDialogSubmit(dialog);

  const nextView = getFirstView();


  const original = driver.views[nextView].view(driver.name, ix.data);
  const embeds   = updateDialogRefEmbeds(original.embeds, dialog.components);


  yield * DiscordApi.editMenu(ix, {
    embeds    : updateUrlContext(embeds),
    components: makeGrid(original.components, ix.data, Cx.Path.empty(), p(ix.message?.components ?? [], Cx.mapFromDiscordRest((rx) => Cx.decode(rx)))),
  });


  return stopContext();
});
