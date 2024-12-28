import {Const, Cx, type Driver, ExV} from '#dfdis';
import {makeGrid} from '#discord/entities/cxt.ts';
import {startContext, stopContext, updateUrlContext} from '#discord/hooks/context.ts';
import {simulateComponentClick, simulateDialogSubmit} from '#discord/hooks/simulate-click.ts';
import {getFirstView, getNextView, getViewModifier} from '#discord/hooks/store-hooks.ts';
import {updateAccessorDialogText, updateAccessorEmbeds} from '#discord/hooks/use-accessor.ts';
import {getPreviousIxForDialog, saveCurrentIxForDialog} from '#discord/relay.ts';
import {CxPath} from '#discord/routing/cx-path.ts';
import {isModalIx, type IxIn} from '#discord/utils/types.ts';
import {RxType} from '#pure/dfx';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import type {IxD} from '#src/internal/discord.ts';
import {CSL, E, g, p, pipe} from '#src/internal/pure/effect.ts';


const decodeDialog = Cx.mapFromData((a, row, col) => pipe(
  Cx.makeFromRest(a),
  Cx.mapSame((cx) => ({
    ...cx,
    route: pipe(
      CxPath.empty(),
      CxPath.set('row', row),
      CxPath.set('row', col),
    ),
  }))),
);


export const implementation = <
  A extends ReturnType<typeof Driver.make>,
>(
  driver: A,
  anyIx: IxD,
) => g(function * () {
  if (anyIx.type === RxType.MODAL_SUBMIT) {
    yield * DiscordApi.deferUpdate(anyIx);
  }

  const ix = anyIx as IxIn;
  const ax = CxPath.parse(ix.data.custom_id);


  // const [server, user] = yield * pipe(
  //   [
  //     MenuCache.serverRead(ix.guild_id!),
  //     MenuCache.userRead(ix.member?.user?.id ?? ix.user!.id),
  //   ] as const,
  //   E.allWith(),
  //   E.catchTag('DeepFryerDynamoError', () => E.succeed([undefined, undefined])),
  // );


  if (ax.mod === Const.CLOSE) {
    return yield * DiscordApi.deleteMenu(ix);
  }


  const rx        = ix.type === RxType.MODAL_SUBMIT ? yield * getPreviousIxForDialog(ax.mod) : ix;
  const rx_embeds = ExV.decodeAll(rx.message?.embeds ?? []);


  startContext(rx_embeds, ax);
  const originalView = getFirstView();

  /**
   * @desc dialog submission
   */
  if (isModalIx(ix.data)) {
    const ax_dx  = decodeDialog(ix.data.components);
    const dialog = driver.views[ax.dialog].view(driver.name, ax.view);

    dialog.components = dialog.components.map((r, row) => r.map((dx, col) => ({
      ...dx,
      data: {
        ...dx.data,
        ...ax_dx[row][col].data,
      },
    } as typeof dx)));


    simulateDialogSubmit(dialog);
    const nextView = getFirstView();


    const original = driver.views[nextView].view(driver.name);
    const embeds   = updateAccessorEmbeds(original.embeds, dialog.components);


    yield * DiscordApi.editMenu(ix, {
      embeds    : updateUrlContext(embeds),
      components: makeGrid(original.components),
    });
    return stopContext();
  }


  const original = driver.views[ax.view].view(driver.name);


  simulateComponentClick(original, ax);


  const nextView         = getNextView();
  const nextViewModifier = getViewModifier();

  /**
   * @desc open dialog
   */
  if (nextViewModifier === Const.DIALOG) {
    const dialog = driver.views[nextView].view(driver.name);

    yield * DiscordApi.openModal(ix, {
      custom_id: p(
        dialog.dialog.route,
        CxPath.set('view', ax.view),
        CxPath.set('mod', ix.id),
        CxPath.build,
      ),
      title     : dialog.dialog.title,
      components: p(
        updateAccessorDialogText(rx_embeds, dialog.components),
        makeGrid,
      ),
    });

    const next            = driver.views[ax.view].view(driver.name);
    const next_embeds     = updateUrlContext(next.embeds, rx_embeds);
    const next_components = makeGrid(next.components);

    yield * saveCurrentIxForDialog(ix, next_embeds, next_components);

    return stopContext();
  }

  /**
   * @desc start an ephemeral chain
   */
  if (nextViewModifier === Const.ENTRY) {
    yield * DiscordApi.deferEntryEphemeral(ix);

    const next            = driver.views[nextView].view(driver.name);
    const next_embeds     = updateUrlContext(next.embeds);
    const next_components = makeGrid(next.components);


    yield * DiscordApi.editMenu(ix, {
      embeds    : next_embeds,
      components: next_components,
    });
    return stopContext();
  }


  /**
   * @desc continue an ephemeral message chain
   */
  yield * DiscordApi.deferUpdate(ix);

  const next            = driver.views[nextView].view(driver.name);
  const next_embeds     = updateUrlContext(next.embeds, rx_embeds);
  const next_components = makeGrid(next.components);

  yield * DiscordApi.editMenu(ix, {
    embeds    : next_embeds,
    components: next_components,
  });

  return stopContext();
}).pipe(
  // E.catchAll((e) => CSL.debug(inspect(e, false, null))),
  E.catchAllDefect((e) => CSL.debug(e)),
);


// const scp = p(sx, Kv.filter((v) => v.route.name === ax.route.name));
// let scn   = {};
//
// if (ax.flags.includes(Flags.Id.Action)) {
//   const slice       = driver.slices[ax.route.name!];
//   const action      = slice.reducers[ax.route.action!];
//   const data        = driver.slices[ax.route.name!].data;
//   const scp_aliased = p(scp, Kv.mapEntries((v) => [data[v.route.data!].data, v]));
//   const scn_aliased = yield * action({}, scp_aliased);
//
//   scn = p(scn_aliased, Kv.mapEntries((v, k) => {
//     const spec = data[k];
//     return [CxVR.makeAccessor(spec.slice, spec.data), Cx.C[spec.type](v as never)];
//   }));
// }


// const parseIx = (ix: IxIn) => {
//   const cxm       = parseCx(ix.message!.components as RestRow[]);
//   const cxd       = parseCx('components' in ix.data ? ix.data.components as RestRow[] : []);
//   const cx        = {...cxm, ...cxd};
//   const data      = ix.data;
//   const dataRoute = v2Router.parse(ix.data.custom_id);
//
//   let values   = [] as str[];
//   let target   = {} as Cx.T;
//   let resolved = {
//     users   : {},
//     roles   : {},
//     channels: {},
//   } as nopt<RestDataResolved>;
//
//   if (isComponentIx(ix.data) && 'values' in data) {
//     target = cx[CxVR.makeAccessorFromVR(dataRoute)];
//     values = data.values as unknown as str[];
//
//     if (target._tag === 'Select') {
//       (target.data as nro<RestStringSelect>).options = target.data.options!.map((option) => ({
//         ...option,
//         default: values.includes(option.value),
//       }));
//     }
//
//     if (target._tag === 'User' || target._tag === 'Role' || target._tag === 'Channel' || target._tag === 'Mention') {
//       resolved = ix.data.resolved! as nopt<RestDataResolved>;
//
//       (target.data as nro<RestStringSelect>).default_values = values.map((v) => ({
//         id  : v as snflk,
//         type: resolveType(resolved, v as snflk),
//       }));
//     }
//   }
//
//   return {
//     cx,
//     ax: {
//       values,
//       route: dataRoute,
//       target,
//       flags: Flags.assignFlags(dataRoute),
//     },
//   };
// };
//
//
// const resolveType = (resolved: nopt<RestDataResolved>, val: snflk) =>
//   resolved.users?.[val] ? 'user'
//     : resolved.roles?.[val] ? 'role'
//       : resolved.channels?.[val] ? 'channel'
//         : 'fail';
//
//
// const parseCx = (rest: RestRow[]) => p(
//   rest,
//   Ar.flatMap((cs) => cs.components.map((c) => p(
//     Cx.makeFromRest(c),
//     Cx.set('route', v2Router.parse((c as {custom_id: str}).custom_id)),
//   ))),
//   Kv.fromIterableWith((cx) => [cx.data.custom_id, cx]),
// );
